/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import foam.box.Skeleton;
import foam.core.ContextAware;
import foam.core.X;
import foam.core.XFactory;
import foam.dao.DAO;
import foam.dao.DAOSkeleton;
import foam.nanos.boot.NSpec;
import foam.nanos.boot.NSpecAware;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.nanos.NanoService;
import foam.nanos.pm.PM;
import foam.util.SafetyUtil;
import java.io.BufferedReader;
import java.io.PrintWriter;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.ServletException;

/**
 * Top-Level Router Servlet.
 * Routes servlet requests based on NSpecDAO configuration.
 * Services can be exported as either Box Skeletons or as WebAgents/Servlets.
 * WebAgents require the service.run.<nspecname> permission.
 */
public class NanoRouter
  extends HttpServlet
  implements NanoService, ContextAware
{
  public static final int BUFFER_SIZE = 4096;

  protected static ThreadLocal<StringBuilder> sb = new ThreadLocal<StringBuilder>() {
      @Override
      protected StringBuilder initialValue() {
        return new StringBuilder();
      }

      @Override
      public StringBuilder get() {
        StringBuilder b = super.get();
        b.setLength(0);
        return b;
      }
    };

  protected X x_;

  protected Map<String, WebAgent> handlerMap_ = new ConcurrentHashMap<>();

  @Override
  protected void service(final HttpServletRequest req, final HttpServletResponse resp)
      throws ServletException, IOException
  {
    String   path       = req.getRequestURI();
    String[] urlParams  = path.split("/");
    String   serviceKey = urlParams[2];
    Object   service    = getX().get(serviceKey);
    DAO      nSpecDAO   = (DAO) getX().get("nSpecDAO");
    NSpec    spec       = (NSpec) nSpecDAO.find(serviceKey);
    WebAgent serv       = getWebAgent(spec, service);
    PM       pm         = new PM(this.getClass(), serviceKey);

    resp.setContentType("text/html");

    try {
      if ( serv == null ) {
        System.err.println("No service found for: " + serviceKey);
        resp.setStatus(resp.SC_NOT_FOUND);
      } else {
        X y = getX().put(HttpServletRequest.class, req)
            .put(HttpServletResponse.class, resp)
            .putFactory(PrintWriter.class, new XFactory() {
              @Override
              public Object create(X x) {
                try {
                  return resp.getWriter();
                } catch (IOException e) {
                  return null;
                }
              }
            })
            .put(NSpec.class, spec);
        X z = y.put(HttpParameters.class, parseParameters(y, req, resp));
        serv.execute(z);
      }
    } catch (Throwable t) {
      System.err.println("Error serving " + serviceKey + " " + path);
      t.printStackTrace();
    } finally {
      if ( ! serviceKey.equals("static") ) pm.log(x_);
    }
  }

  protected WebAgent getWebAgent(NSpec spec, Object service) {
    if ( spec == null ) return null;

    if ( ! handlerMap_.containsKey(spec.getName()) ) {
      handlerMap_.put(spec.getName(), createWebAgent(spec, service));
    }

    return handlerMap_.get(spec.getName());
  }

  protected WebAgent createWebAgent(NSpec spec, Object service) {
    informService(service, spec);

    if ( spec.getServe() ) {
      try {
        Class cls = spec.getBoxClass() != null && spec.getBoxClass().length() > 0 ?
            Class.forName(spec.getBoxClass()) :
            DAOSkeleton.class ;
        Skeleton skeleton = (Skeleton) cls.newInstance();

        // TODO: create using Context, which should do this automatically
        if ( skeleton instanceof ContextAware ) ((ContextAware) skeleton).setX(getX());

        informService(skeleton, spec);

        skeleton.setDelegateObject(service);

        service = new ServiceWebAgent(skeleton, spec.getAuthenticate());
        informService(service, spec);
      } catch (IllegalAccessException | InstantiationException | ClassNotFoundException ex) {
        ex.printStackTrace();
        ((Logger) getX().get("logger")).error("Unable to create NSPec servlet: " + spec.getName());
      }
    } else {
      if ( service instanceof WebAgent && spec.getAuthenticate() ) {
        service = new AuthWebAgent("service.run." + spec.getName(), (WebAgent) service);
      }
    }

    if ( service instanceof WebAgent ) return (WebAgent) service;

    Logger logger = (Logger) getX().get("logger");
    logger.error(this.getClass(), spec.getName() + " does not have a WebAgent.");
    return null;
  }

  protected void informService(Object service, NSpec spec) {
    if ( service instanceof ContextAware ) ((ContextAware) service).setX(getX());
    if ( service instanceof NSpecAware   ) ((NSpecAware) service).setNSpec(spec);
  }

  protected HttpParameters parseParameters(X x, HttpServletRequest req, HttpServletResponse resp)
    throws IOException {

    Logger              logger      = (Logger) getX().get("logger");
    String              methodName  = req.getMethod();
    String              accept      = req.getHeader("Accept");
    String              contentType = req.getHeader("Content-Type");
    BufferedReader      reader      = req.getReader();
    Command             command     = Command.select;
    HttpParameters      parameters  = null;

    logger = new PrefixLogger(new Object[] { this.getClass().getSimpleName() }, logger);

    try {
      //
      // NOTE: X must contain HttpServletRequest and HttpServletResponse
      //
      parameters = (HttpParameters) x.create(DefaultHttpParameters.class);
      //parameters.setX(x);
    } catch (ClassCastException exception) {
      throw new RuntimeException(exception);
    }

    // Capture 'data' on all requests
    if ( ! SafetyUtil.isEmpty(req.getParameter("data")) ) {
      logger.debug("data", req.getParameter("data"));
      parameters.set("data", req.getParameter("data"));
    } else {
      //
      // When content-type is other than application/x-www-form-urlencoded, the
      // HttpServletRequest.reader stream must be processes manually to extract
      // parameters from the body.
      //
      // Future considerations for partial parameters in the POST URI
      // see examples: https://technologyconversations.com/2014/08/12/rest-api-with-json/
      //
      try {
        int read = 0;
        int count = 0;
        int length = req.getContentLength();

        StringBuilder builder = sb.get();
        char[] cbuffer = new char[BUFFER_SIZE];
        while ( ( read = reader.read(cbuffer, 0, BUFFER_SIZE)) != -1 && count < length ) {
          builder.append(cbuffer, 0, read);
          count += read;
        }
        logger.debug("reader data:", builder.toString());
        if ( ! SafetyUtil.isEmpty(builder.toString()) ) {
          parameters.set("data", builder.toString());
        }
      } catch (IOException e) {
        resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "Failed to parse body/data.");
        throw e;
      }
    }

    if ( ! "application/x-www-form-urlencoded".equals(contentType) ) {
      switch ( methodName.toUpperCase() ) {
      case "POST":
        command = Command.put;
        break;
      case "PUT":
        command = Command.put;
        break;
      case "DELETE":
        command = Command.remove;
        break;
        // defauts to SELECT
      }
    } else {
      String cmd = req.getParameter("cmd");
      logger.debug("command", cmd);
      if ( ! SafetyUtil.isEmpty(cmd) ) {
        switch ( cmd.toLowerCase() ) {
        case "put":
          command = Command.put;
          break;
        case "remove":
          command = Command.remove;
          break;
        case "help":
          command = Command.help;
          break;
          // defaults to SELECT
        }
      } else {
        logger.warning("cmd/method could not be determined, defaulting to SELECT.");
      }
    }
    parameters.set("cmd", command);

    Format format = Format.JSON;
    resp.setContentType("text/html");
    if ( ! SafetyUtil.isEmpty(accept) && ! "application/x-www-form-urlencoded".equals(contentType) ) {
      logger.debug("accept", accept);
      String[] formats = accept.split(";");
      for ( int i = 0; i < formats.length; i++ ) {
        String f = formats[i].trim();
        if ( "application/json".equals(f) ) {
          format = Format.JSON;
          resp.setContentType(f);
          break;
        }
        if ( "application/jsonj".equals(f) ) {
          format = Format.JSONJ;
          resp.setContentType("application/json");
          break;
        }
        if ( "application/xml".equals(f) ) {
          format = Format.XML;
          resp.setContentType(f);
          break;
        }
      }
    } else {
      String f = req.getParameter("format");
      logger.debug("format", format);
      if ( ! SafetyUtil.isEmpty(f) ) {
        switch ( f.toUpperCase() ) {
        case "XML":
          format = Format.XML;
          resp.setContentType("application/xml");
          break;
        case "JSON":
          format = Format.JSON;
          resp.setContentType("application/json");
          break;
        case "JSONJ":
          format = Format.JSONJ;
          resp.setContentType("application/json");
          break;
        case "CSV":
          format = Format.CSV;
          resp.setContentType("text/plain");
          break;
        case "HTML":
          format = Format.HTML;
          resp.setContentType("text/html");
          break;
        }
      } else {
        logger.warning("accept/format could not be determined, defaulting to JSON.");
      }
    }
    parameters.set("format", format);

    logger.debug("parameters", parameters);
    return parameters;
  }

  @Override
  public void start() {

  }

  @Override
  public X getX() {
    return x_;
  }

  @Override
  public void setX(X x) {
    x_ = x;
  }
}
