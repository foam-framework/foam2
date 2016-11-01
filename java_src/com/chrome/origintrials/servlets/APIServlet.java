package com.chrome.origintrials.servlets;

import java.io.*;
import java.nio.*;
import javax.servlet.http.*;
import javax.servlet.*;
import foam.core.*;
import foam.dao.*;
import foam.box.*;
import foam.lib.json.*;

import com.chrome.origintrials.model.*;
import com.chrome.origintrials.dao.*;

import com.chrome.origintrials.services.*;
import com.chrome.origintrials.services.impl.*;

public class APIServlet extends HttpServlet {
  private X x;

  private DAO applicationDAO;
  private DAOSkeleton applicationDAOSkeleton;

  public void init(ServletConfig config) throws ServletException {
    x = EmptyX.instance();


    TokenService service = x.create(TestTokenServiceImpl.class);

    x = x.put("tokenService", service);

    applicationDAO = x.create(DatastoreDAO.class).setOf(Application.getOwnClassInfo());
    applicationDAO = x.create(ApplicationDAO.class).setDelegate(applicationDAO);

    x = x.put("applicationDAO", applicationDAO);

    applicationDAOSkeleton = x.create(DAOSkeleton.class).setDelegate(applicationDAO);

    super.init(config);
  }

  public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    PrintWriter out = resp.getWriter();
    out.println("Hello from api servlet.");
    out.flush();
    return;
  }

  public void doOptions(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    resp.addHeader("Access-Control-Allow-Origin", "*");
    resp.setStatus(resp.SC_OK);
    resp.flushBuffer();
  }

  public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    resp.addHeader("Access-Control-Allow-Origin", "*");

    X requestContext = x.put("httpRequest", req).put("httpResponse", resp);

    CharBuffer buffer_ = CharBuffer.allocate(65535);
    Reader reader = req.getReader();
    int count = reader.read(buffer_);
    buffer_.rewind();


    FObject request = new JSONParser(requestContext).parseString(buffer_.toString());

    if ( request == null || ! ( request instanceof foam.box.Message ) ) {
      resp.setStatus(resp.SC_BAD_REQUEST);
      resp.flushBuffer();
      return;
    }

    foam.box.Message msg = (foam.box.Message)request;
    applicationDAOSkeleton.send(msg);

    if ( ! ( msg.getReplyBox() instanceof foam.box.HTTPReplyBox ) ) {
      resp.setStatus(resp.SC_OK);
      resp.flushBuffer();
    }
  }
}
