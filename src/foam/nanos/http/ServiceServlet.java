/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import foam.box.*;
import foam.core.*;
import foam.core.FObject;
import foam.dao.*;
import foam.lib.json.JSONParser;
import foam.lib.json.Outputter;
import foam.lib.parse.*;
import foam.lib.parse.StringPS;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.Reader;
import java.nio.CharBuffer;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.ServletException;

@SuppressWarnings("serial")
public class ServiceServlet
  extends    HttpServlet
  implements ContextAware
{
  protected Object      service_;
  protected DAOSkeleton skeleton_;
  protected X           x_;

  public ServiceServlet(Object service) {
    service_ = service;
    // TODO: Use FacetManager when ready
    skeleton_ = new DAOSkeleton();
    skeleton_.setDelegate((DAO) service);
  }

  public X    getX() { return x_; }
  public void setX(X x) { x_ = x; skeleton_.setX(x); }

  @Override
  public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    resp.setHeader("Access-Control-Allow-Origin", "*");
    resp.setStatus(resp.SC_OK);
    resp.flushBuffer();
  }

  public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    try {
    CharBuffer buffer_        = CharBuffer.allocate(65535);
    Reader     reader         = req.getReader();
    int        count          = reader.read(buffer_);
    X          requestContext = getX().put("httpRequest", req).put("httpResponse", resp);

    System.out.println("Service Request");
    resp.setHeader("Access-Control-Allow-Origin", "*");
    buffer_.rewind();

System.out.println("Request: " + buffer_.toString()); buffer_.rewind();

    FObject result = requestContext.create(JSONParser.class).parseString(buffer_.toString());

    if ( result == null ) {
      resp.setStatus(resp.SC_BAD_REQUEST);
      PrintWriter out = resp.getWriter();
      System.err.println("Failed to parse request");
      out.print("Failed to parse request");
      out.flush();
      return;
    }

    if ( ! ( result instanceof foam.box.Message ) ) {
      resp.setStatus(resp.SC_BAD_REQUEST);
      PrintWriter out = resp.getWriter();
      System.err.println("Expected instance of foam.box.Message");
      out.print("Expected instance of foam.box.Message");
      out.flush();
      return;
    }

    foam.box.Message msg = (foam.box.Message) result;

    skeleton_.send(msg);

    System.err.println("Response: " + msg.getObject().toString());

    if ( ! ( msg.getAttributes().get("replyBox") instanceof foam.box.HTTPReplyBox ) ) {
      // resp.complete(); //flushBuffer();
      System.err.println("No ReplyBox");
    }
    resp.setStatus(resp.SC_OK);
    resp.flushBuffer();
  } catch (Throwable t) {
    System.err.println("Error: " + t);
    t.printStackTrace();
  }
  }

  public void doOptions(HttpServletRequest req, HttpServletResponse resp)
    throws IOException, ServletException
  {
    resp.setHeader("Access-Control-Allow-Origins", "*");
    resp.setHeader("Access-Control-Allow-Methods", "GET POST");
    resp.setHeader("Access-Control-Allow-Headers", "Content-Type");
    super.doOptions(req, resp);
  }
}
