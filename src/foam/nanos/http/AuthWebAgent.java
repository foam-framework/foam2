/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.User;
import foam.nanos.session.Session;
import foam.util.SafetyUtil;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;

public class AuthWebAgent
    extends ProxyWebAgent
{
  public final static String SESSION_ID = "sessionId";

  protected String permission_;

  public AuthWebAgent(String permission, WebAgent delegate) {
    setDelegate(delegate);
    permission_ = permission;
  }

  public Cookie getCookie(HttpServletRequest req) {
    Cookie[] cookies = req.getCookies();

    if ( cookies != null )
      for ( Cookie cookie : cookies )
        if ( cookie.getName().toString().equals(SESSION_ID) )
          return cookie;

    return null;
  }

  public void createCookie(X x, Session session){
    HttpServletResponse resp   = x.get(HttpServletResponse.class);
    Cookie              cookie = new Cookie(SESSION_ID, session.getId());

    resp.addCookie(cookie);
  }

  public void templateLogin(X x) {
    PrintWriter out = x.get(PrintWriter.class);

    out.println("<form method=post>");
    out.println("<h1>Login</h1>");
    out.println("<br>");
    out.println("<label style=\"display:inline-block;width:70px;\">Email:</label>");
    out.println("<input name=\"user\" type=\"string\" size=\"30\" style=\"display:inline-block;\"></input>");
    out.println("<br>");
    out.println("<label style=\"display:inline-block;width:70px;\">Password:</label>");
    out.println("<input name=\"password\" type=\"password\" size=\"30\" style=\"display:inline-block;\"></input>");
    out.println("<br>");
    out.println("<button type=submit style=\"display:inline-block;margin-top:10px;\";>Log In</button>");
    out.println("</form>");
  }

  /** If provided, use user and password parameters to login and create session and cookie. **/
  public Session authenticate(X x) {
    // context parameters
    HttpServletRequest req          = x.get(HttpServletRequest.class);
    AuthService        auth         = (AuthService) x.get("auth");
    DAO                sessionDAO   = (DAO) x.get("sessionDAO");

    // query parameters
    String             email        = req.getParameter("user");
    String             password     = req.getParameter("password");

    // instance parameters
    Session            session      = null;
    Cookie             cookie       = getCookie(req);
    boolean            attemptLogin = ! SafetyUtil.isEmpty(email) && ! SafetyUtil.isEmpty(password);

    // get session id from either query parameters or cookie
    String sessionId = ( ! SafetyUtil.isEmpty(req.getParameter("sessionId")) ) ?
        req.getParameter("sessionId") : ( cookie != null ) ?
        cookie.getValue().toString() : null;

    if ( ! SafetyUtil.isEmpty(sessionId) ) {
      session = (Session) sessionDAO.find(sessionId);
      if ( session == null ) {
        session = new Session();
        session.setId(sessionId);
      } else if ( ! attemptLogin && session.getContext().get("user") != null ) {
        return session;
      }
    } else {
      // create new cookie
      session = new Session();
      createCookie(x, session);
    }

    if ( ! attemptLogin ) {
      return null;
    }

    try {
      User user = auth.loginByEmail(session.getContext(), email, password);
      if ( user != null ) {
        return session;
      }
    } catch (Throwable t) {
      t.printStackTrace();
    }

    PrintWriter out = x.get(PrintWriter.class);
    out.println("Authentication failure.");
    return null;
  }

  public void execute(X x) {
    AuthService         auth    = (AuthService) x.get("auth");
    Session             session = authenticate(x);

    if ( session != null && session.getContext() != null ) {
      if ( auth.check(session.getContext(), permission_) ) {
        getDelegate().execute(x.put(Session.class, session).put("user", session.getContext().get("user")));
      } else {
        PrintWriter out = x.get(PrintWriter.class);
        out.println("Access denied. Need permission: " + permission_);
      }
    } else {
      templateLogin(x);
    }
  }
}
