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
import foam.nanos.logger.Logger;
import foam.nanos.session.Session;
import foam.util.SafetyUtil;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.util.StringTokenizer;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.bouncycastle.util.encoders.Base64;

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
        if ( SESSION_ID.equals(cookie.getName()) )
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
    out.println("<input name=\"user\" id=\"user\" type=\"string\" size=\"30\" style=\"display:inline-block;\"></input>");
    out.println("<br>");
    out.println("<label style=\"display:inline-block;width:70px;\">Password:</label>");
    out.println("<input name=\"password\" id=\"password\" type=\"password\" size=\"30\" style=\"display:inline-block;\"></input>");
    out.println("<br>");
    out.println("<button type=submit style=\"display:inline-block;margin-top:10px;\"; onclick=\"checkEmpty()\">Log In</button>");
    out.println("</form>");
    out.println("<script>function checkEmpty() { if ( document.getElementById('user').value == '') { alert('Email Required'); } else if ( document.getElementById('password').value == '') { alert('Password Required'); } }</script>");

  }

  /** If provided, use user and password parameters to login and create session and cookie. **/
  public Session authenticate(X x) {
    Logger             logger       = (Logger) x.get("logger");

    // context parameters
    HttpServletRequest req          = x.get(HttpServletRequest.class);
    HttpServletResponse resp        = x.get(HttpServletResponse.class);
    AuthService        auth         = (AuthService) x.get("auth");
    DAO                sessionDAO   = (DAO) x.get("sessionDAO");

    // query parameters
    String             email        = req.getParameter("user");
    String             password     = req.getParameter("password");
    String             authHeader   = req.getHeader("Authorization");

    // instance parameters
    Session            session      = null;
    Cookie             cookie       = getCookie(req);
    boolean            attemptLogin = ! SafetyUtil.isEmpty(authHeader) || ( ! SafetyUtil.isEmpty(email) && ! SafetyUtil.isEmpty(password) );

    // get session id from either query parameters or cookie
    String sessionId = ( ! SafetyUtil.isEmpty(req.getParameter("sessionId")) ) ?
        req.getParameter("sessionId") : ( cookie != null ) ?
        cookie.getValue() : null;

    if ( ! SafetyUtil.isEmpty(sessionId) ) {
      session = (Session) sessionDAO.find(sessionId);
      if ( session == null ) {
        session = new Session();
        session.setId(sessionId);
        createCookie(x, session);
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

    //
    // Support for Basic HTTP Authentication
    // Redimentary testing: curl --user username:password http://localhost:8080/service/dig
    //   visually inspect results, on failure you'll see the dig login page.
    //
    try {
      if ( ! SafetyUtil.isEmpty(authHeader) ) {
        StringTokenizer st = new StringTokenizer(authHeader);
        if ( st.hasMoreTokens() ) {
          String basic = st.nextToken();
          if ( basic.equalsIgnoreCase("basic") ) {
            try {
              String credentials = new String(Base64.decode(st.nextToken()), "UTF-8");
              int index = credentials.indexOf(":");
              if ( index > 0 ) {
                String username = credentials.substring(0, index).trim();
                if ( ! username.isEmpty() ) {
                  email = username;
                }
                String passwd = credentials.substring(index + 1).trim();
                if ( ! passwd.isEmpty() ) {
                  password = passwd;
                }
              } else {
                logger.debug("Invalid authorization token.");
              }
            } catch (UnsupportedEncodingException e) {
              logger.warning(e, "Unsupported authentication encoding, expecting Base64.");
              if ( ! SafetyUtil.isEmpty(authHeader) ) {
                resp.sendError(HttpServletResponse.SC_NOT_ACCEPTABLE, "Supported Authentication Encodings: Base64");
                return null;
              }
            }
          } else {
            logger.warning("Unsupported authorization type, expecting Basic, received: "+basic);
            if ( ! SafetyUtil.isEmpty(authHeader) ) {
              resp.sendError(HttpServletResponse.SC_NOT_ACCEPTABLE, "Supported Authorizations: Basic");
              return null;
            }
          }
        }
      }

      try {
        User user = auth.loginByEmail(session.getContext(), email, password);

        if ( user != null ) {
          return session;
        } else {
          // user should not be null, any login failure should throw an Exception
          logger.error("AuthService.loginByEmail returned null user and did not throw AuthenticationException.");
          // TODO: generate stack trace.
          if ( ! SafetyUtil.isEmpty(authHeader) ) {
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
          } else {
            PrintWriter out = x.get(PrintWriter.class);
            out.println("Authentication failure.");
          }
        }
      } catch (javax.naming.AuthenticationException e) {
        if ( ! SafetyUtil.isEmpty(authHeader) ) {
          resp.sendError(HttpServletResponse.SC_UNAUTHORIZED, e.getMessage());
        } else {
          PrintWriter out = x.get(PrintWriter.class);
          out.println("Authentication failure.");
        }
      }
    } catch (java.io.IOException | IllegalStateException e) { // thrown by HttpServletResponse.sendError
      logger.error(e);
    }

    return null;
  }

  public void execute(X x) {
    AuthService auth    = (AuthService) x.get("auth");
    Session     session = authenticate(x);

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
