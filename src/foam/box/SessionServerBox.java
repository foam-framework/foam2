/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.box;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.AuthenticationException;
import foam.nanos.auth.AuthorizationException;
import foam.nanos.auth.Group;
import foam.nanos.boot.Boot;
import foam.nanos.boot.NSpec;
import foam.nanos.logger.Logger;
import foam.nanos.session.Session;
import foam.util.SafetyUtil;
import org.eclipse.jetty.server.Request;

import javax.servlet.http.HttpServletRequest;

import static foam.mlang.MLang.EQ;

/**
 * This Box decorator adds session support to boxes.
 *
 * Its core purpose is to create a new context using parts of the context it was
 * created with and parts of a user's session context to pass on to its delegate
 * box. This class also enforces authorization and authentication controls for
 * the NSpec in the context.
 */
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
      DAO                sessionDAO = (DAO) getX().get("localSessionDAO");
      Session            session    = sessionID == null ? null : (Session) sessionDAO.find(EQ(Session.ACCESS_TOKEN, sessionID));

      if ( session == null ) {
        session = new Session((X) getX().get(Boot.ROOT));

        // It's fine to let clients choose their session access token if they're
        // creating a new session because we'll change it when the user
        // authenticates anyway, so there's no risk of a session fixation attack.
        if ( ! SafetyUtil.isEmpty(sessionID) ) session.setAccessToken(sessionID);

        if ( req != null ) session.setRemoteHost(req.getRemoteHost());

        session = (Session) sessionDAO.put(session);
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

      // If this service has been configured to require authentication, then
      // throw an error if there's no user in the context.
      if ( authenticate_ && session.getUserId() == 0 ) {
        msg.replyWithException(new AuthenticationException());
        return;
      }

      X effectiveContext = session.applyTo(getX());

      session.touch();

      // TODO: Shouldn't this go somewhere else?
      if ( req != null && ! SafetyUtil.isEmpty(req.getRequestURI()) ) {
        AppConfig appConfig = (AppConfig) effectiveContext.get("appConfig");
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
        effectiveContext = effectiveContext.put("appConfig", appConfig);
      }

      try {
        spec.checkAuthorization(effectiveContext);
      } catch (AuthorizationException e) {
        Group group = (Group) effectiveContext.get("group");
        logger.warning("Missing permission", group != null ? group.getId() : "NO GROUP" , "service." + spec.getName());
        msg.replyWithException(e);
        return;
      }

      // Decorate the reply box to add the sessionId as an attribute to the
      // message. This informs the client of the server-generated session id.
      Box replyBox = (Box) msg.getAttributes().get("replyBox");
      if ( replyBox != null ) {
        Session finalSession = session;
        msg.getAttributes().put("replyBox", new ProxyBox(replyBox) {
          @Override
          public void send(Message innerMsg) {
            // The access token might have been updated. For example,
            // UserAndGroupAuthService will update the session access token when
            // a user authenticates (signs in) in order to prevent session
            // fixation attacks.
            innerMsg.getAttributes().put("sessionId", finalSession.getAccessToken());
            super.send(innerMsg);
          }
        });
      }

      msg.getLocalAttributes().put("x", effectiveContext);
    } catch (Throwable t) {
      logger.error("Error throw in SessionServerBox: " + t, " ,service: " + spec.getName());
      t.printStackTrace();
      msg.replyWithException(t);
      return;
    }

    getDelegate().send(msg);
  }
}
