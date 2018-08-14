/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import foam.core.X;
import foam.nanos.http.Command;
import foam.nanos.http.Format;
import foam.nanos.http.HttpParameters;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.util.SafetyUtil;
import java.io.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class HttpParametersWebAgent
  extends ProxyWebAgent
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

  protected Class parametersClass = DefaultHttpParameters.class;

  public HttpParametersWebAgent() {}
  public HttpParametersWebAgent(WebAgent delegate) {
    setDelegate(delegate);
  }

  public HttpParametersWebAgent(String parametersClassName, WebAgent delegate) {
    setParametersClass(parametersClassName);
    setDelegate(delegate);
  }

  public void setParametersClass(String parametersClassName) {
    try {
      this.parametersClass = Class.forName(parametersClassName);
    } catch (ClassNotFoundException exception) {
      throw new RuntimeException(exception);
    }
  }

  public void execute(X x) {
    Logger              logger = (Logger) x.get("logger");
    HttpServletRequest  req    = x.get(HttpServletRequest.class);
    HttpServletResponse resp   = x.get(HttpServletResponse.class);

    logger = new PrefixLogger(new Object[] { this.getClass().getSimpleName() }, logger);

    if ( req == null || resp == null ) {
      logger.error(new java.lang.IllegalArgumentException("Context missing HttpServletRequest, HttpServletResponse"));
      return;
    }

    String         methodName      = req.getMethod();
    String         accept          = req.getHeader("Accept");
    String         contentType     = req.getHeader("Content-Type");
    HttpParameters parameters      = null;
    Class          parametersClass = null;
    Command        command         = Command.select;
    String         cmd             = req.getParameter("cmd");

    logger.debug("methodName", methodName);

    try {
      parameters = (HttpParameters) x.create(this.parametersClass);
    } catch (ClassCastException exception) {
      throw new RuntimeException(exception);
    }

    // Capture 'data' on all requests
    if ( ! SafetyUtil.isEmpty(req.getParameter("data")) ) {
      logger.debug("data", req.getParameter("data"));
      logger.debug("cmd", req.getParameter("cmd"));
      logger.debug("format", req.getParameter("format"));

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

        int read   = 0;
        int count  = 0;
        int length = req.getContentLength();

        StringBuilder  builder = sb.get();
        char[] cbuffer = new char[BUFFER_SIZE];
        BufferedReader reader  = new BufferedReader(new InputStreamReader(req.getInputStream()));

        while ( ( read = reader.read(cbuffer, 0, BUFFER_SIZE)) != -1 && count < length ) {
          builder.append(cbuffer, 0, read);
          count += read;
        }
        logger.debug("reader data:", builder.toString());
        if ( ! SafetyUtil.isEmpty(builder.toString()) ) {
          parameters.set("data", builder.toString());
        }
      } catch (IOException e) {
        try {
          resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "Failed to parse body/data.");
        } catch (IOException ioe) {
          // nop
        }
        return;
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
//      case "HELP":
//        command = Command.help;
//        resp.setContentType("text/html");
//        break;
      case "GET":
        if ( ! SafetyUtil.isEmpty(cmd) ) {
          switch ( cmd.toLowerCase() ) {
            case "put":
              command = Command.put;
              break;
            case "remove":
              command = Command.remove;
              parameters.set("id", req.getParameter("id"));
              logger.debug("id", req.getParameter("id"));
              break;
            case "help":
              command = Command.help;
              resp.setContentType("text/html");
              break;
            // defaults to SELECT
          }
        } else {
          logger.warning("cmd/method could not be determined, defaulting to SELECT.");
        }
       break;
       // defauts to SELECT
      }
    } else {
      cmd = req.getParameter("cmd");
      logger.debug("command", cmd);
      if ( ! SafetyUtil.isEmpty(cmd) ) {
        switch ( cmd.toLowerCase() ) {
        case "put":
          command = Command.put;
          break;
        case "remove":
          command = Command.remove;
          parameters.set("id", req.getParameter("id"));
          logger.debug("id", req.getParameter("id"));
          break;
        case "help":
          command = Command.help;
          resp.setContentType("text/html");
          break;
          // defaults to SELECT
        }
      } else {
        logger.warning("cmd/method could not be determined, defaulting to SELECT.");
      }
    }
    parameters.set("cmd", command);
    parameters.set(Command.class, command);

    Format format = Format.JSON;
    resp.setContentType("text/html");
    if ( req.getParameter("format") != null && ! "".equals(req.getParameter("format").trim()) && command != Command.help ) {
      String f = req.getParameter("format");
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
        default:
          logger.warning("accept/format could not be determined, default to JSON.");
      }
    }
    else if ( ! SafetyUtil.isEmpty(accept) && ! "application/x-www-form-urlencoded".equals(contentType)  ) {
      logger.debug("accept", accept);
      String[] formats = accept.split(";");
      int i;
      for ( i = 0 ; i < formats.length; i++ ) {
        String f = formats[i].trim();

        if ( f.contains("application/json") ) {
          format = Format.JSON;
          resp.setContentType("application/json");
          break;
        }
        if ( f.contains("application/jsonj") ) {
          format = Format.JSONJ;
          resp.setContentType("application/jsonj");
          break;
        }
        if ( f.contains("application/xml") ) {
          format = Format.XML;
          resp.setContentType("application/xml");
          break;
        }
        if ( f.contains("text/html") ) {
          format = Format.HTML;
          resp.setContentType("text/html");
          break;
        }
      }
      if ( i == formats.length ) {
        logger.warning("accept/format could not be determined, default to JSON.");
      }
    } else {
      logger.warning("accept/format could not be determined, default to JSON.");
    }
    parameters.set("format", format);
    parameters.set(Format.class, format);

    logger.debug("parameters", parameters);
    x = x.put(HttpParameters.class, parameters);
    getDelegate().execute(x);
  }
}
