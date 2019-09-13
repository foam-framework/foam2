/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.box;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.*;
import foam.nanos.auth.AuthenticationException;
import foam.nanos.auth.AuthorizationException;
import foam.nanos.boot.NSpec;
import foam.nanos.logger.*;
import foam.nanos.logger.PrefixLogger;
import foam.nanos.session.Session;
import foam.util.SafetyUtil;
import java.util.Date;
import javax.naming.NoPermissionException;
import javax.servlet.http.HttpServletRequest;
import org.eclipse.jetty.server.Request;

public class SessionServerBox
  extends ProxyBox
{
  protected boolean authenticate_;

  public SessionServerBox(X x, Box delegate, boolean authenticate) {
    super(x, delegate);
    authenticate_ = authenticate;
  }

  public void send(Message msg) {
    String sessionID = (String) msg.getAttributes().get("sessionId");
    Logger logger    = (Logger) getX().get("logger");

    if ( sessionID == null && authenticate_ ) {
      msg.replyWithException(new IllegalArgumentException("sessionid required for authenticated services"));
      return;
    }

    NSpec spec = getX().get(NSpec.class);

    try {
      HttpServletRequest req        = getX().get(HttpServletRequest.class);
      AuthService        auth       = (AuthService) getX().get("auth");
      DAO                sessionDAO = (DAO)         getX().get("localSessionDAO");
      Session            session    = sessionID == null ? null : (Session) sessionDAO.find(sessionID);

      if ( session == null ) {
        session = new Session();
        session.setId(sessionID == null ? "anonymous" : sessionID);
        session.setRemoteHost(req.getRemoteHost());

        // Set the user to null to avoid the system user from leaking into
        // newly created sessions. If we don't do this, then a user has admin
        // privileges before they log in, which is obviously a big security
        // issue.
        // We also need to null out the AuthService cache, otherwise the system
        // context's cache will be reused across every session.
        X sessionContext = getX()
          .put("user", null)
          .put("group", null)
          .put(CachingAuthService.CACHE_KEY, null)
          .put(Session.class, session);
        session.setContext(sessionContext);
        if ( sessionID != null ) {
          session = (Session) sessionDAO.put(session);
        }
      } else if ( req != null ) {
        // if req == null it means that we're being accessed via webSockets
        if ( ! session.validRemoteHost(req.getRemoteHost()) ) {
          // If an existing session is reused with a different remote host then
          // delete the session and force a re-login.
          // This is done as a security measure to reduce the likelihood of
          // session hijacking. If an attacker were to get ahold of another
          // user's session id, they could start using that session id in the
          // requests they send to the server and gain access to the real user's
          // session and therefore their privileges and data. By forcing users
          // to sign back in when the remote host changes, we reduce the attack
          // surface for session hijacking. Session hijacking is still possible,
          // but only if the user is on the same remote host.
          logger.warning("Remote host for session ", sessionID, " changed from ", session.getRemoteHost(), " to ", req.getRemoteHost(), ". Deleting session and forcing the user to sign in again.");
          sessionDAO.remove(session);
          msg.replyWithException(new AuthenticationException("IP address changed. Your session was deleted to keep your account secure. Please sign in again to verify your identity."));
          return;
        }
      }

      User user = (User) session.getContext().get("user");
      X    x    = session.getContext()
        .put(
          "logger",
          new PrefixLogger(
              new Object[] { user == null ? "" : user.getId() + " - " + user.label(), "[Service]", spec.getName() },
              (Logger) session.getContext().get("logger")))
        .put(HttpServletRequest.class, req);

      session.touch();

      // If this service has been configured to require authentication, then
      // throw an error if there's no user in the context.
      if ( authenticate_ && session.getUserId() == 0 ) {
        msg.replyWithException(new AuthenticationException());
        return;
      }

      // If there is no user in the session (which happens when a user is
      // signing up, for example) then set the URL in the app configuration to
      // the URL that the request is coming from.
      if ( req != null && ! SafetyUtil.isEmpty(req.getRequestURI()) ) {
        AppConfig appConfig = (AppConfig) x.get("appConfig");
        appConfig = (AppConfig) appConfig.fclone();
        String configUrl = ((Request) req).getRootURL().toString();

        if ( appConfig.getForceHttps() ) {
          if ( configUrl.startsWith("https://") ) {
            // Don't need to do anything.
          } else if ( configUrl.startsWith("http://") ) {
            configUrl = "https" + configUrl.substring(4);
          } else {
            configUrl = "https://" + configUrl;
          }
        }

        appConfig.setUrl(configUrl);
        x = x.put("appConfig", appConfig);
        session.getContext().put("appConfig", appConfig);
      }

      if ( user != null ) {
        Group group = (Group) x.get("group");

        try {
          spec.checkAuthorization(session.getContext());
        } catch (AuthorizationException e) {
          logger.warning("Missing permission", group != null ? group.getId() : "NO GROUP" , "service." + spec.getName());
          msg.replyWithException(e);
          return;
        }

        // padding this because if group is null this can cause an NPE
        // technically the user shouldn't be created without a group
        if ( group == null ) {
          logger.warning(String.format("The context with id = %s does not have the group set in the context.", session.getId()));
        } else {
          AppConfig appConfig = group.getAppConfig(x);
          x = x.put("appConfig", appConfig);
          session.getContext().put("appConfig", appConfig);
        }
      }

      msg.getLocalAttributes().put("x", x);
    } catch (Throwable t) {
      logger.error("Error throw in SessionServerBox: " + t, " ,service: " + spec.getName());
      t.printStackTrace();
      msg.replyWithException(t);
      return;
    }

    getDelegate().send(msg);
  }
}
