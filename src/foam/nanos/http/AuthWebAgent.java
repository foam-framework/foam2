/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.AgentAuthService;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.AuthenticationException;
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
    if ( cookies == null ) {
      return null;
    }

    for ( Cookie cookie : cookies ) {
      if ( SESSION_ID.equals(cookie.getName()) ) {
        return cookie;
      }
    }

    return null;
  }

  public void createCookie(X x, Session session) {
    HttpServletResponse resp = x.get(HttpServletResponse.class);
    resp.addCookie(new Cookie(SESSION_ID, session.getId()));
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
    out.println("<button id=\"login\" type=submit style=\"display:inline-block;margin-top:10px;\";>Log In</button>");
    out.println("</form>");
    out.println("<script>document.getElementById('login').addEventListener('click', checkEmpty); function checkEmpty() { if ( document.getElementById('user').value == '') { alert('Email Required'); } else if ( document.getElementById('password').value == '') { alert('Password Required'); } }</script>");
  }

  /** If provided, use user and password parameters to login and create session and cookie. **/
  /** Takes a context, and if provided, use user and password parameters to login and 
   * create session and cookie in a new context and return it. **/
  
  public X authenticate(X x) {
    Logger              logger       = (Logger) x.get("logger");

    // context parameters
    HttpServletRequest  req          = x.get(HttpServletRequest.class);
    HttpServletResponse resp         = x.get(HttpServletResponse.class);
    AuthService         auth         = (AuthService) x.get("auth");
    DAO                 sessionDAO   = (DAO) x.get("localSessionDAO");

    // query parameters
    String              email        = req.getParameter("user");
    String              password     = req.getParameter("password");
    String              actAs        = req.getParameter("actAs");
    String              authHeader   = req.getHeader("Authorization");

    // instance parameters
    Session             session      = null;
    Cookie              cookie       = getCookie(req);
    boolean             attemptLogin = ! SafetyUtil.isEmpty(authHeader) || ( ! SafetyUtil.isEmpty(email) && ! SafetyUtil.isEmpty(password) );
    
    // get session id from either query parameters or cookie
    String sessionId = ( ! SafetyUtil.isEmpty(req.getParameter("sessionId")) ) ?
        req.getParameter("sessionId") : ( cookie != null ) ?
        cookie.getValue() : null;

    if ( ! SafetyUtil.isEmpty(sessionId) ) {  // we have a sessionID
      session = (Session) sessionDAO.find(sessionId);
      if ( session == null ) { // if session is not in sessionDAO, create and put one.
        session = new Session(x); // this session.context is global context with null user
        session.setId(sessionId);
        session.setRemoteHost(req.getRemoteHost());
        sessionDAO.put(session);
      }

      // create a cookie and put in resp object
      createCookie(x, session);

      // if there is a user in the session context, and not attempted login, return session contet
      if ( ! attemptLogin && session.getContext().get("user") != null ) {
        return session.getContext();
      }
    } else { // sessionId is empty
      // create a new session, put in sessionDAO, set a cookie in the response class
      session = new Session(x); // this session.context is global context with null user
      session.setRemoteHost(req.getRemoteHost());
      createCookie(x, session);
      sessionDAO.put(session);
    }

    X sessionX =  session.getContext()
      .put(HttpServletRequest.class, req)
      .put(HttpServletResponse.class, resp);

    if ( ! attemptLogin ) {
      return sessionX;
    }

    // Support for Basic HTTP Authentication
    // Rudimentary testing: curl --user username:password http://localhost:8080/service/dig?actAs=1234
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
                return sessionX;
              }
            }
          } else {
            logger.warning("Unsupported authorization type, expecting Basic, received: " + basic);
            if ( ! SafetyUtil.isEmpty(authHeader) ) {
              resp.sendError(HttpServletResponse.SC_NOT_ACCEPTABLE, "Supported Authorizations: Basic");
              return sessionX;
            }
          }
        }
      }

      try {
        // setting user in the context, email, password);
        User user = auth.loginByEmail(sessionX, email, password);
        if ( user != null ) {
          // If user is attempting to, and can act as another entity, set the entity in session context
          if ( ! SafetyUtil.isEmpty(actAs) ) {
            AgentAuthService agentService = (AgentAuthService) x.get("agentAuth");
            DAO localUserDAO = (DAO) x.get("localUserDAO");
            User entity = (User) localUserDAO.find(Long.parseLong(actAs));
            if ( agentService.canActAs(x, user, entity) ) {
              // set agent in session
              sessionX = sessionX.put("agent", user).put("user", entity);
            }
          }
          return sessionX;
        }
        // user should not be null, any login failure should throw an Exception
        logger.error("AuthService.loginByEmail returned null user and did not throw AuthenticationException.");
        // TODO: generate stack trace.
        if ( ! SafetyUtil.isEmpty(authHeader) ) {
          resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        } else {
          PrintWriter out = x.get(PrintWriter.class);
          out.println("Authentication failure.");
        }
      } catch ( AuthenticationException e ) {
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

    return sessionX;
  }

  public void execute(X x) {
    AuthService auth = (AuthService) x.get("auth");
    // pass x to authenticate, which will return a context with a session, and user and agent set
    X sessionX = authenticate(x);
    if ( sessionX.get("user") != null ) {
      if ( auth.check(sessionX, permission_) ) {
        getDelegate().execute(sessionX);
      } else {
        PrintWriter out = x.get(PrintWriter.class);
        out.println("Access denied. Need permission: " + permission_);
        ((foam.nanos.logger.Logger) x.get("logger")).debug("Access denied, requires permission:", permission_);
      }
    } else {
      templateLogin(x);
    }
  }
}
