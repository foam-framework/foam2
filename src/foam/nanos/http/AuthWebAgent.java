/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import foam.box.HTTPAuthorizationType;
import foam.core.X;
import foam.core.XLocator;
import foam.dao.DAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.*;
import foam.nanos.boot.Boot;
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
import foam.core.XFactory;
import java.io.IOException;
import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;

/**
 * A WebAgent decorator that adds session and authentication support.
 */
public class AuthWebAgent
  extends ProxyWebAgent
{
  public final static String SESSION_ID = "sessionId";

  protected String permission_;
  protected SendErrorHandler sendErrorHandler_;

  public AuthWebAgent(String permission, WebAgent delegate, SendErrorHandler sendErrorHandler) {
    setDelegate(delegate);
    permission_ = permission;
    sendErrorHandler_ = sendErrorHandler;
  }

  @Override
  public void execute(X x) {
    AuthService auth    = (AuthService) x.get("auth");
    Session     session = authenticate(x);

    if ( session == null ) {
      try {
        XLocator.set(x);
        templateLogin(x);
      } finally {
        XLocator.set(null);
      }
      return;
    }

    if ( ! auth.check(session.getContext(), permission_) ) {
      PrintWriter out = x.get(PrintWriter.class);
      out.println("Access denied. Need permission: " + permission_);
      ((foam.nanos.logger.Logger) x.get("logger")).debug("Access denied, requires permission", permission_,"subject", x.get("subject"));
      return;
    }

    // Create a per-request sub-context of the session context which
    // contains necessary Servlet request/response objects.
    X x_ = x;
    X requestX = session.getContext()
      .put(HttpServletRequest.class,  x.get(HttpServletRequest.class))
      .put(HttpServletResponse.class, x.get(HttpServletResponse.class))
      // "lazy" the invoking of getWriter(). It prevents throwing exception from calling getOutputStream() later in the code.
      // The calling context provided a PrintWriter, but it needs to be explicitly passed on the requestX context, similar to HttpServletRequest/Response.
      .putFactory(PrintWriter.class, new XFactory() {
        @Override
        public Object create(X x) {
          return x_.get(PrintWriter.class);
        }
      });
    
    try {
      XLocator.set(requestX);
      super.execute(requestX);
    } finally {
      XLocator.set(null);
    }
  }

  /** If provided, use user and password parameters to login and create session and cookie. **/
  public Session authenticate(X x) {
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
   try {
      if ( ! SafetyUtil.isEmpty(authHeader) ) {
        StringTokenizer st = new StringTokenizer(authHeader);
        if ( st.hasMoreTokens() ) {
          String authType = st.nextToken();
          if ( HTTPAuthorizationType.BEARER.getName().equalsIgnoreCase(authType) ) {
            //
            // Support for Bearer token
            // wget --header="Authorization: Bearer 8b4529d8-636f-a880-d0f2-637650397a71" \
            //     http://localhost:8080/service/memory
            //
            String token = st.nextToken();
            Session tmp = null;

            // test and use non-clustered sessions
            DAO internalSessionDAO = (DAO) x.get("localInternalSessionDAO");
            if ( internalSessionDAO != null ) {
              tmp = (Session) internalSessionDAO.find(token);
              if ( tmp != null ) {
                tmp.setClusterable(false);
              }
            }
            if ( tmp == null ) {
              tmp = (Session) sessionDAO.find(token);
            }
            if ( tmp != null ) {
              try {
                tmp.validateRemoteHost(x);
                session = tmp;
                String remoteIp = foam.net.IPSupport.instance().getRemoteIp(x);
                if ( SafetyUtil.isEmpty(session.getRemoteHost()) ||
                     ! SafetyUtil.equals(session.getRemoteHost(), remoteIp) ) {
                  session.setRemoteHost(remoteIp);
                  session = (Session) sessionDAO.put(session);
                }
                session.touch();

                X effectiveContext = session.applyTo(x);
                // Make context available to thread-local XLocator
                XLocator.set(effectiveContext);
                session.setContext(effectiveContext);
                return session;
              } catch( foam.core.ValidationException e ) {
                logger.debug(e.getMessage(), foam.net.IPSupport.instance().getRemoteIp(x));
                sendError(x, resp, HttpServletResponse.SC_UNAUTHORIZED, "Invalid Source Address.");
                return null;
              }
            } else {
              logger.debug("Invalid authentication token.", token);
              sendError(x, resp, HttpServletResponse.SC_UNAUTHORIZED, "Invalid authentication token.");
              return null;
            }
          } else if ( HTTPAuthorizationType.BASIC.getName().equalsIgnoreCase(authType) ) {
            //
            // Support for Basic HTTP Authentication
            // Redimentary testing: curl --user username:password http://localhost:8080/service/dig
            //   visually inspect results, on failure you'll see the dig login page.
            //
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
                logger.debug("Invalid authentication credentials. Unable to parse username:password");
                sendError(x, resp, HttpServletResponse.SC_UNAUTHORIZED, "Invalid authentication credentials.");
                return null;
              }
            } catch (UnsupportedEncodingException e) {
              logger.warning(e, "Unsupported authentication encoding, expecting Base64.");
              if ( ! SafetyUtil.isEmpty(authHeader) ) {
                sendError(x, resp, HttpServletResponse.SC_NOT_ACCEPTABLE, "Supported Authentication Encodings: Base64");
                return null;
              }
            }
          } else {
            logger.warning("Unsupported authorization type, expecting Basic or Bearer, received: "+authType);
            if ( ! SafetyUtil.isEmpty(authHeader) ) {
              sendError(x, resp, HttpServletResponse.SC_NOT_ACCEPTABLE, "Supported Authorizations: Basic, Bearer");
              return null;
            }
          }
        }
      }

      try {
        String sessionId = req.getParameter(SESSION_ID);
        if ( SafetyUtil.isEmpty(sessionId) ) {
          Cookie cookie = getCookie(req);
          if ( cookie != null ) {
            sessionId = cookie.getValue();
          }
        }
        if ( ! SafetyUtil.isEmpty(sessionId) ) {
          session = (Session) sessionDAO.find(sessionId);
        }
        if ( session == null ) {
          session = createSession(x);
          if ( ! SafetyUtil.isEmpty(sessionId) ) {
            session.setId(sessionId);
          }
          session = (Session) sessionDAO.put(session);
        }
        session.touch();

        try {
          session.validateRemoteHost(x);
        } catch (foam.core.ValidationException e) {
          logger.debug(e.getMessage(), foam.net.IPSupport.instance().getRemoteIp(x));
          if ( ! SafetyUtil.isEmpty(authHeader) ) {
            sendError(x, resp, HttpServletResponse.SC_UNAUTHORIZED, "Access denied");
          } else {
            PrintWriter out = x.get(PrintWriter.class);
            out.println("Access denied");
          }
          return null;
        }

        String remoteIp = foam.net.IPSupport.instance().getRemoteIp(x);
        if ( SafetyUtil.isEmpty(session.getRemoteHost()) ||
             ! SafetyUtil.equals(session.getRemoteHost(), remoteIp) ) {
          session.setRemoteHost(remoteIp);
          session = (Session) sessionDAO.put(session);
        }
        User user = ((Subject) session.getContext().get("subject")).getUser();
        if ( user != null &&
             SafetyUtil.isEmpty(email) ) {
          return session;
        }
 
        user = auth.login(session.getContext()
          .put(HttpServletRequest.class,  req)
          .put(HttpServletResponse.class, resp), email, password);

        if ( user != null ) {
          if ( ! SafetyUtil.isEmpty(actAs) ) {
            AgentAuthService agentService = (AgentAuthService) x.get("agentAuth");
            DAO localUserDAO = (DAO) x.get("localUserDAO");
            try {
              User entity = (User) localUserDAO.find(Long.parseLong(actAs));
              agentService.actAs(session.getContext(), entity);
            } catch (java.lang.NumberFormatException e) {
              logger.error("actAs must be a number:" + e);
              return null;
            }
          }
          return session;
        }

        // user should not be null, any login failure should throw an Exception
        logger.error("AuthService.login returned null user and did not throw AuthenticationException.");
        // TODO: generate stack trace.
        if ( ! SafetyUtil.isEmpty(authHeader) ) {
          sendError(x, resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Authentication failure.");
        } else {
          if ( sendErrorHandler_ == null || sendErrorHandler_.redirectToLogin(x) ) {
            templateLogin(x);
          } else {
            PrintWriter out = x.get(PrintWriter.class);
            out.println("Authentication failure.");
          }
        }
      } catch ( AuthenticationException e ) {
        if ( ! SafetyUtil.isEmpty(authHeader) ) {
          sendError(x, resp, HttpServletResponse.SC_UNAUTHORIZED, e.getMessage());
        } else {
          if ( sendErrorHandler_ == null || sendErrorHandler_.redirectToLogin(x) ) {
            templateLogin(x);
          } else {
            PrintWriter out = x.get(PrintWriter.class);
            out.println("Authentication failure.");
          }
        }
      }
    } catch (java.io.IOException | IllegalStateException e) { // thrown by HttpServletResponse.sendError
      logger.error(e);
    }

    return null;
  }

  private void sendError(X x, HttpServletResponse resp, int status, String message) throws java.io.IOException
  {
    if ( sendErrorHandler_ == null ) {
      resp.sendError(status, message);
      return;
    }

    sendErrorHandler_.sendError(x, status, message);
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

  public Session createSession(X x) {
    HttpServletRequest req     = x.get(HttpServletRequest.class);
    Session            session = new Session((X) x.get(Boot.ROOT));
    session.setRemoteHost(req.getRemoteHost());
    session.setContext(session.applyTo(x));
    return session;
  }

  public void templateLogin(X x) {
    // Skip the redirect to login if it is not necessary
    if ( sendErrorHandler_ != null && !sendErrorHandler_.redirectToLogin(x) ) return;

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
}
