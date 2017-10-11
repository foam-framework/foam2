package com.chrome.origintrials.servlets;

import java.io.*;
import java.nio.*;
import javax.servlet.http.*;
import javax.servlet.*;
import foam.core.*;
import foam.dao.*;
import foam.box.*;
import foam.lib.json.*;

import com.chrome.origintrials.Context;

public class TaskServlet extends HttpServlet {
  private X x;

  public void init(ServletConfig config) throws ServletException {
    x = Context.instance();
  }

  public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    PrintWriter out = resp.getWriter();
    out.println("Hello from task servlet.");
    out.flush();
    return;
  }

  public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    resp.setStatus(resp.SC_OK);
    resp.flushBuffer();
  }
}
