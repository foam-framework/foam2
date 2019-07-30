/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import foam.box.Skeleton;
import foam.core.ContextAware;
import foam.core.Detachable;
import foam.core.X;
import foam.core.XFactory;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.dao.SessionDAOSkeleton;
import foam.nanos.NanoService;
import foam.nanos.boot.NSpec;
import foam.nanos.boot.NSpecAware;
import foam.nanos.logger.Logger;
import foam.nanos.pm.PM;
import foam.nanos.pm.PMWebAgent;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

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
  protected X x_;

  protected Map<String, WebAgent> handlerMap_ = new ConcurrentHashMap<>();
  protected DAO nSpecDAO_;

  @Override
  public void init(javax.servlet.ServletConfig config) throws javax.servlet.ServletException {
    Object x = config.getServletContext().getAttribute("X");
    if ( x != null && x instanceof foam.core.X ) x_ = (foam.core.X) x;

    nSpecDAO_ = (DAO) x_.get("nSpecDAO");
    nSpecDAO_.listen(new AbstractSink() {
      @Override
      public void put(Object obj, Detachable sub) {
        NSpec sp = (NSpec) obj;
        handlerMap_.remove(sp.getName());
      }
    }, null);

    super.init(config);
  }

  @Override
  protected void service(final HttpServletRequest req, final HttpServletResponse resp)
    throws ServletException, IOException
  {
    String   path       = req.getRequestURI();
    String[] urlParams  = path.split("/");
    String   serviceKey = urlParams[2];
    Object   service    = getX().get(serviceKey);
    NSpec    spec       = (NSpec) nSpecDAO_.find(serviceKey);
    WebAgent serv       = getWebAgent(spec, service);
    PM       pm         = new PM(this.getClass(), serviceKey);

    resp.setContentType("text/html");
    
    // prevent browsers from changing content-type in response  
    resp.setHeader("X-Content-Type-Options", "nosniff");
    // do not allow browser to cache response data
    resp.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    // same as cache-control, used for backwards compatibility with HTTP/1.0
    resp.setHeader("Pragma", "no-cache");
    // enable xss filtering to allow browser to sanitize page if xss attack is detected
    resp.setHeader("X-XSS-Protection", "1");
    // protect against clickjacking attacks
    resp.setHeader("X-Frame-Options", "deny");
    
    try {
      if ( serv == null ) {
        System.err.println("No service found for: " + serviceKey);
        resp.sendError(resp.SC_NOT_FOUND, "No service found for: "+serviceKey);
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
        serv.execute(y);
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
            SessionDAOSkeleton.class ;
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
      if ( service instanceof WebAgent ) {
        WebAgent pmService = (WebAgent) service;

        if ( spec.getParameters() ) {
          service = new HttpParametersWebAgent((WebAgent) service);
        }
        if ( spec.getPm() ) {
          service = new PMWebAgent(pmService.getClass(), spec.getName(), (WebAgent) service);
        }

        //
        // NOTE: Authentication must be last as HttpParametersWebAgent will consume the authentication parameters.
        //
        if ( spec.getAuthenticate() ) {
          service = new AuthWebAgent("service.run." + spec.getName(), (WebAgent) service);
        }
      }
    }

/*
    if ( service instanceof WebAgent ) {
      service = new WebAgentServlet((WebAgent) service);
      informService(service, spec);
    }
    */

    if ( service instanceof WebAgent ) return (WebAgent) service;

    Logger logger = (Logger) getX().get("logger");
    logger.error(this.getClass(), spec.getName() + " does not have a WebAgent.");
    return null;
  }

  protected void informService(Object service, NSpec spec) {
    if ( service instanceof ContextAware ) ((ContextAware) service).setX(getX());
    if ( service instanceof NSpecAware   ) ((NSpecAware) service).setNSpec(spec);
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
