/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import foam.core.*;
import foam.dao.DAO;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.User;
import foam.nanos.http.ProxyWebAgent;
import foam.nanos.http.WebAgent;
import foam.nanos.session.Session;
import foam.util.SafetyUtil;
import java.io.PrintWriter;
import java.util.Date;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class AuthWebAgent
  extends ProxyWebAgent
{
  public final static String SESSION_ID = "sessionId";

  protected String permission_;

  public AuthWebAgent(String permission, WebAgent delegate) {
    setDelegate(delegate);
    permission_ = permission;
  }

  public void execute(X x) {
    HttpServletRequest  req        = (HttpServletRequest) x.get(HttpServletRequest.class);
    HttpServletResponse resp       = (HttpServletResponse) x.get(HttpServletResponse.class);
    PrintWriter         out        = (PrintWriter) x.get(PrintWriter.class);
    AuthService         auth       = (AuthService) x.get("auth");
    DAO                 sessionDAO = (DAO) x.get("sessionDAO");
    String              sessionId  = null;
    Cookie              cookie     = getCookie(req);

    attemptLogin(x);

    if ( cookie != null ) {
      sessionId       = cookie.getValue().toString();
      Session session = (Session) sessionDAO.find(sessionId);

      if ( session != null && session.getContext() != null ) {
        if ( auth.check(session.getContext(), permission_) ) {
          getDelegate().execute(x.put(Session.class, session).put("user", session.getContext().get("user")));
        } else {
          out.println("Access denied. Need permission: " + permission_);
        }
      } else {
        templateLogin(x);
      }
    }
  }

  public Cookie getCookie(HttpServletRequest req) {
    Cookie[] cookies = req.getCookies();

    if ( cookies != null )
      for ( Cookie cookie : cookies )
        if ( cookie.getName().toString().equals(SESSION_ID) )
          return cookie;

    return null;
  }

  public void templateLogin(X x) {
    PrintWriter out = (PrintWriter) x.get(PrintWriter.class);

    out.println("<form method=post>");
    out.println("<h1>Login</h1>");
    out.println("<br>");
    out.println("<label style=\"display:inline-block;width:70px;\">Email:</label>");
    out.println("<input name=\"email\" type=\"string\" size=\"30\" style=\"display:inline-block;\"></input>");
    out.println("<br>");
    out.println("<label style=\"display:inline-block;width:70px;\">Password:</label>");
    out.println("<input name=\"password\" type=\"password\" size=\"30\" style=\"display:inline-block;\"></input>");
    out.println("<br>");
    out.println("<button type=submit style=\"display:inline-block;margin-top:10px;\";>Log In</button>");
    out.println("</form>");
  }

  public boolean attemptLogin(X x) {
    HttpServletRequest req        = (HttpServletRequest) x.get(HttpServletRequest.class);
    String             email      = req.getParameter("email");
    String             password   = req.getParameter("password");
    AuthService        auth       = (AuthService) x.get("auth");
    PrintWriter        out        = (PrintWriter) x.get(PrintWriter.class);
    Session            session    = new Session();
    DAO                sessionDAO = (DAO) x.get("sessionDAO");

    if ( SafetyUtil.isEmpty(email) || SafetyUtil.isEmpty(password) ) return false;

    try {

      User user = (User) auth.loginByEmail(session.getContext(), email, password);
      if ( user != null ) {
        createCookie(x, session);
        return true;
      }
    } catch (Throwable t) {
      t.printStackTrace();
    }

    out.println("Authentication failure.");

    return false;
  }

  public void createCookie(X x, Session session){
    HttpServletResponse resp   = (HttpServletResponse) x.get(HttpServletResponse.class);
    PrintWriter         out    = (PrintWriter)         x.get(PrintWriter.class);
    Cookie              cookie = new Cookie(SESSION_ID, session.getId());

    resp.addCookie(cookie);
    out.println("<script>");
    out.println("window.location.href = window.location.href;");
    out.println("</script>");
  }
}
