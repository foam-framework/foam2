/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.AuthenticationException;
import foam.nanos.auth.AuthorizationException;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.session.Session;
import foam.util.SafetyUtil;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * ProxyWebAgent that checks for a sessionId in the query parameters of the request,
 * finds the session, and checks the permissions of the user who owns that session before
 * executing the delegate
 */
public class SessionWebAgent
    extends ProxyWebAgent
{
  protected String permission_;

  public SessionWebAgent(String permission, WebAgent delegate) {
    setDelegate(delegate);
    permission_ = permission;
  }

  @Override
  public void execute(X x) {
    Logger              logger     = (Logger) x.get("logger");
    DAO                 userDAO    = (DAO) x.get("localUserDAO");
    DAO                 sessionDAO = (DAO) x.get("localSessionDAO");
    AuthService         auth       = (AuthService) x.get("auth");
    HttpServletRequest  req        = x.get(HttpServletRequest.class);
    HttpServletResponse resp       = x.get(HttpServletResponse.class);

    try {
      String sessionId = "";

      // check for session id in cookie
      Cookie[] cookies = req.getCookies();

      if ( cookies != null ) {
        for ( Cookie c : cookies ) {
          if ( c.getName().equals("sessionId") ) {
            sessionId = c.getValue();
            break;
          }
        }
      }

      // fallback: check for session id as request param
      if ( sessionId.equals("") ) {
        sessionId = req.getParameter("sessionId");
      }

      if ( SafetyUtil.isEmpty(sessionId) ) {
        throw new AuthenticationException("Invalid session id");
      }

      // display a warning if querystring contains sessionId
      if ( req.getQueryString().contains("sessionId") ) {
        logger.warning(
          "\033[31;1m" +
          "Querystring contains 'sessionId'! Please inform the security team!" +
          "\033[0m"
        );
      }

      // find session
      Session session = (Session) sessionDAO.find(sessionId);
      if ( session == null || session.getContext() == null ) {
        throw new AuthenticationException("Session not found");
      }

      // find user
      User user = (User) userDAO.find(session.getUserId());
      if ( user == null ) {
        throw new AuthenticationException("User not found");
      }

      // check permissions
      session.setContext(session.getContext().put("user", user));
      if ( ! auth.check(session.getContext(), permission_) ) {
        throw new AuthorizationException();
      }

      // execute delegate
      getDelegate().execute(session.getContext().put(HttpServletResponse.class, resp).put(HttpServletRequest.class, req));
  } catch ( Throwable t ) {
      logger.error("Unexpected exception in SessionWebAgent", t);
      // throw unauthorized on error
      resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    }
  }
}
