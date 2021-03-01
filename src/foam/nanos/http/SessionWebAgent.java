/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import foam.core.X;
import foam.core.XFactory;
import foam.dao.DAO;
import foam.nanos.auth.*;
import foam.nanos.logger.Logger;
import foam.nanos.session.Session;
import foam.util.SafetyUtil;
import java.io.IOException;
import java.io.PrintWriter;
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

      // fallback: check for session id as request param
      if ( sessionId.equals("") ) {
        sessionId = req.getParameter("sessionId");
      }

      if ( SafetyUtil.isEmpty(sessionId) ) {
        throw new AuthenticationException("Invalid session id");
      }

      // display a warning if querystring contains sessionId
      // TODO: whitelist 'services' that we allow/expect sessionId,
      // such as file requests
      if ( req.getQueryString().contains("sessionId") ) {
        if ( ! req.getRequestURI().contains("httpFileService") ) {
          logger.warning(
            "\033[31;1m" +
            req.getRequestURI() +
            " contains 'sessionId'! Please inform the security team!" +
            "\033[0m"
            );
        }
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
      Subject subject = new Subject.Builder(x).setUser(user).build();
      session.setContext(session.getContext().put("subject", subject));
      if ( ! auth.check(session.getContext(), permission_) ) {
        throw new AuthorizationException();
      }

      // execute delegate
      // Update session context with support setup from earlier WebAgents.
      getDelegate().execute(session.getContext().put(HttpServletResponse.class, resp).put(HttpServletRequest.class, req));

    } catch ( AuthorizationException e ) {
      // report permission issues
      logger.warning("SessionWebAgent", e);
      resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    } catch ( AuthenticationException e ) {
      logger.debug("SessionWebAgent", e);
      resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    } catch ( Throwable t ) {
      logger.error("Unexpected exception in SessionWebAgent", t);
      resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    }
  }
}
