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

import com.chrome.origintrials.Context;

public class APIServlet extends HttpServlet {
  private X x;
  private BoxRegistryBox registry;

  public void init(ServletConfig config) throws ServletException {
    x = Context.instance();

    Box applicationDAOSkeleton = x.create(DAOSkeleton.class).setDelegate((DAO)x.get("applicationDAO"));
    Box experimentDAOSkeleton = x.create(DAOSkeleton.class).setDelegate((DAO)x.get("experimentDAO"));


    registry = (BoxRegistryBox)x.get("registry");

    registry.register2("applications", null, applicationDAOSkeleton);
    registry.register2("experiments", null, experimentDAOSkeleton);

    super.init(config);
  }

  public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    PrintWriter out = resp.getWriter();
    out.println("Hello from api servlet.");
    out.flush();
    return;
  }

  public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    X requestContext = x.put("httpRequest", req).put("httpResponse", resp).put("principal", req.getUserPrincipal());

    CharBuffer buffer_ = CharBuffer.allocate(65535);
    Reader reader = req.getReader();
    int count = reader.read(buffer_);
    buffer_.rewind();

    FObject request = requestContext.create(JSONParser.class).parseString(buffer_.toString());

    if ( request == null || ! ( request instanceof foam.box.Message ) ) {
      resp.setStatus(resp.SC_BAD_REQUEST);
      resp.flushBuffer();
      return;
    }

    foam.box.Message msg = (foam.box.Message)request;

    registry.send(msg);
  }
}
