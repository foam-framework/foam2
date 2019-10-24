/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import foam.box.Box;
import foam.box.CapabilityInterceptReplyDecoratorBox;
import foam.box.SessionServerBox;
import foam.core.FObject;
import foam.core.ProxyX;
import foam.core.X;
import foam.lib.json.ExprParser;
import foam.lib.json.JSONParser;
import foam.lib.parse.*;
import foam.nanos.logger.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.PrintWriter;

@SuppressWarnings("serial")
public class ServiceWebAgent
    implements WebAgent
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

  protected Box     skeleton_;
  protected boolean authenticate_;

  public ServiceWebAgent(Box skeleton, boolean authenticate) {
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

  public void execute(X x) {
    try {
      HttpServletRequest  req            = x.get(HttpServletRequest.class);
      HttpServletResponse resp           = x.get(HttpServletResponse.class);
      PrintWriter         out            = x.get(PrintWriter.class);
      BufferedReader      reader         = req.getReader();
      X                   requestContext = x.put("httpRequest", req).put("httpResponse", resp);
      Logger              logger         = (Logger) x.get("logger");

      resp.setHeader("Access-Control-Allow-Origin", "*");

      int read = 0;
      int count = 0;
      int length = req.getContentLength();

      StringBuilder builder = sb.get();
      char[] cbuffer = new char[BUFFER_SIZE];
      while ( ( read = reader.read(cbuffer, 0, BUFFER_SIZE)) != -1 && count < length ) {
        builder.append(cbuffer, 0, read);
        count += read;
      }

      FObject result;
      try {
        result = requestContext.create(JSONParser.class).parseString(builder.toString());
      } catch (Throwable t) {
        System.err.println("Unable to parse: " + builder.toString());
        throw t;
      }

      if ( result == null ) {
        resp.setStatus(resp.SC_BAD_REQUEST);
        String message = getParsingError(x, builder.toString());
        logger.error("JSON parse error: " + message + ", input: " + builder.toString());
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

      foam.box.Message msg = (foam.box.Message) result;
      foam.box.Box srvrBox =
        new SessionServerBox(x, skeleton_, authenticate_);
      srvrBox = new CapabilityInterceptReplyDecoratorBox.Builder(x)
        .setDelegate(srvrBox)
        .build();
      srvrBox.send(msg);
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
