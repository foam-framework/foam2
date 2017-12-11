/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import foam.box.*;
import foam.core.*;
import foam.core.FObject;
import foam.lib.json.ExprParser;
import foam.lib.json.JSONParser;
import foam.lib.parse.*;
import foam.nanos.logger.Logger;
import java.io.*;
import java.nio.CharBuffer;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.ServletException;

@SuppressWarnings("serial")
public class ServiceWebAgent
  implements WebAgent
{
  protected Object  service_;
  protected Box     skeleton_;
  protected boolean authenticate_;

  public ServiceWebAgent(Object service, Box skeleton, boolean authenticate) {
    service_      = service;
    skeleton_     = skeleton;
    authenticate_ = authenticate;
  }

/*
  public X    getX() { return x_; }
  public void setX(X x) {
    x_ = x;
    if ( skeleton_ instanceof ContextAware )
      ((ContextAware) skeleton_).setX(x);
  }
*/

/*
  @Override
  public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    resp.setHeader("Access-Control-Allow-Origin", "*");
    resp.setStatus(resp.SC_OK);
    resp.flushBuffer();
  }
*/

  public synchronized void execute(X x) {
    try {
      HttpServletRequest  req            = (HttpServletRequest)  x.get(HttpServletRequest.class);
      HttpServletResponse resp           = (HttpServletResponse) x.get(HttpServletResponse.class);
      PrintWriter         out            = (PrintWriter) x.get(PrintWriter.class);
      CharBuffer          buffer_        = CharBuffer.allocate(65535);
      BufferedReader      reader         = req.getReader();
      int                 count          = reader.read(buffer_);
      X                   requestContext = x.put("httpRequest", req).put("httpResponse", resp);
      Logger              logger         = (Logger) x.get("logger");

      resp.setHeader("Access-Control-Allow-Origin", "*");
      buffer_.rewind();

      FObject result;
      try {
        result = requestContext.create(JSONParser.class).parseString(buffer_.toString());
      } catch (Throwable t) {
        System.err.println("Unable to parse: " + buffer_.toString());
        throw t;
      }

      if ( result == null ) {
        resp.setStatus(resp.SC_BAD_REQUEST);
        String message = getParsingError(x, buffer_.toString());
        logger.error("JSON parse error: " + message + ", input: " + buffer_.toString());
        out.flush();
        return;
      }

      if ( ! ( result instanceof foam.box.Message ) ) {
        resp.setStatus(resp.SC_BAD_REQUEST);
        logger.error("Expected instance of foam.box.Message");
        out.print("Expected instance of foam.box.Message");
        out.flush();
        return;
      }

      // TODO: make skeleton_.send() take x instead
      if ( service_ instanceof ContextAware )
        ((ContextAware) service_).setX(x);

      foam.box.Message msg = (foam.box.Message) result;
      new SessionServerBox(x, skeleton_, authenticate_).send(msg);
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  /**
   * Gets the result of a failing parsing of a buffer
   * @param buffer the buffer that failed to be parsed
   * @return the error message
   */
  protected String getParsingError(X x, String buffer) {
    Parser        parser = new ExprParser();
    PStream       ps     = new StringPStream();
    ParserContext psx    = new ParserContextImpl();

    ((StringPStream) ps).setString(buffer);
    psx.set("X", x == null ? new ProxyX() : x);

    ErrorReportingPStream eps = new ErrorReportingPStream(ps);
    ps = eps.apply(parser, psx);
    return eps.getMessage();
  }

/*
  public void doOptions(HttpServletRequest req, HttpServletResponse resp)
    throws IOException, ServletException
  {
    resp.setHeader("Access-Control-Allow-Origins", "*");
    resp.setHeader("Access-Control-Allow-Methods", "GET POST");
    resp.setHeader("Access-Control-Allow-Headers", "Content-Type");
    super.doOptions(req, resp);
  }
  */
}
