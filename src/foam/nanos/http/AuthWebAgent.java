/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import foam.core.*;
import foam.nanos.http.ProxyWebAgent;
import foam.nanos.http.WebAgent;
import java.io.PrintWriter;
import foam.nanos.auth.AuthService;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import foam.nanos.session.Session;
import foam.dao.DAO;
import foam.nanos.auth.User;

public class AuthWebAgent
  extends ProxyWebAgent
{
  public AuthWebAgent(WebAgent delegate) {
    setDelegate(delegate);
  }

  public void execute(X x) {
    HttpServletRequest  req  = (HttpServletRequest) x.get(HttpServletRequest.class);
    HttpServletResponse resp = (HttpServletResponse) x.get(HttpServletResponse.class);
    PrintWriter         out  = (PrintWriter) x.get(PrintWriter.class);

    DAO                 sessionDAO = (DAO) x.get("sessionDAO");

    Cookie[] cookies = req.getCookies();
    String sessionId = null;
    if(cookies != null){
      for ( Cookie cookie : cookies ) {
        if (cookie.getName().toString().equals("sessionId")){
          sessionId = cookie.getValue().toString();
          Session session = (Session) sessionDAO.find(sessionId);
          if ( session != null ) {
            getDelegate().execute(x);
          }
        } else {
          templateLogin(x);
        }
      }
    } else {
      templateLogin(x);
    }
  }

  public void templateLogin(X x) {
    PrintWriter        out  = (PrintWriter) x.get(PrintWriter.class);
    HttpServletRequest req  = (HttpServletRequest) x.get(HttpServletRequest.class);
    String             emailReq = req.getParameter("email");
    String             passwordReq = req.getParameter("password");

    out.println("<form method=post>");
    out.println("<h1>Login</h1>");
    out.println("<br>");
    out.println("<label>Email:</label>");
    out.println("<input name=\"email\" type=\"string\" style=\"width:100px;display:inline-block;\"></input>");
    out.println("<br>");
    out.println("<label>Password:</label>");
    out.println("<input name=\"password\" type=\"password\" style=\"width:100px;display:inline-block;\"></input>");
    out.println("<br>");
    out.println("<button type=submit style=\"display:inline-block;margin-top:10px;\";>Log In</button>");
    out.println("</form>");
    attemptLogin(x, emailReq, passwordReq);
  }

  public void attemptLogin(X x, String email, String password){
    AuthService        auth = (AuthService) x.get("auth");
    PrintWriter        out  = (PrintWriter) x.get(PrintWriter.class);

    try {
      Session session = new Session();
      x = x.put(Session.class, session);
      User user = (User) auth.loginByEmail(x, email, password);
      if ( user != null ) {
        createCookie(session, x);
      } else {
        out.println("Authentication failure.");
      }
    } catch (Throwable t) {
      t.printStackTrace();
    }
  }

  public void createCookie(Session session, X x){
    HttpServletResponse resp  = (HttpServletResponse) x.get(HttpServletResponse.class);
    PrintWriter        out  = (PrintWriter) x.get(PrintWriter.class);
    Cookie cookie = new Cookie("sessionId", session.getId());
    resp.addCookie(cookie);
    out.println("<script>");
    out.println("window.location.href = window.location.href;");
    out.println("</script>");
  }
}