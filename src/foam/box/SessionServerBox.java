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

    if ( sessionID == null ) {
      msg.replyWithException(new IllegalArgumentException("sessionid is missing"));
      return;
    }
    try {
      NSpec              spec       = getX().get(NSpec.class);
      HttpServletRequest req        = getX().get(HttpServletRequest.class);
      AuthService        auth       = (AuthService) getX().get("auth");
      DAO                sessionDAO = (DAO)         getX().get("localSessionDAO");
      Session            session    = (Session)     sessionDAO.find(sessionID);

      if ( session == null ) {
        session = new Session();
        session.setId(sessionID);

        /**
         * Since we are now accounting for requests which are sent through proxies which have the X-Forwarded-For header
         * We need to take care of 2 cases:
         * 1. if the request was sent through a proxy (X-Forwarded-For != null)
         * 2. if the request was not sent through a proxy (X-Forwarded-For == null)
         */
        if ( req.getHeader("X-Forwarded-For") != null ) {

          /**
           * Case 1. Sent through proxy
           * SourceHost should be the IP stored in the X-Forwarded-For header
           * ProxyHost should the IP returned by getRemoteHost() since it is the most recent node that the request was passed through
           */
          session.setSourceHost(req.getHeader("X-Forwarded-For"));
          session.setProxyHost(req.getRemoteHost());
        } else {
          /**
           * Case 2. Not sent through proxy
           * SourceHost should be the IP returned by getRemoteHost() since there are no proxies
           * ProxyHost should be null by default
           */
          session.setSourceHost(req.getRemoteHost());
        }
        
        // Set the user to null to avoid the system user from leaking into
        // newly created sessions. If we don't do this, then a user has admin
        // privileges before they log in, which is obviously a big security
        // issue.
        session.setContext(getX().put("user", null).put("group", null).put(Session.class, session));
        sessionDAO.put(session);
      } else if ( req != null ) {
        // if req == null it means that we're being accessed via webSockets
        // we should be sure to handle both cases

        /**
         * similar to above, we have to account for two cases: proxy and non-proxy
         * 1. isProxiedReqDifferent: X-Forwarded-For header exists and session source host is equivalent to the X-Forwarded-For header
         * 2. isNonProxiedReqDifferent: X-Forwarded-For header does not exist and session source host is equivalent to req.getRemoteHost()
         * If one is true, the other will be automatically false since the X-Forwarded-For header can either exist or not exist
         */
        boolean isProxiedReqDifferent = req.getHeader("X-Forwarded-For") != null && ! SafetyUtil.equals(session.getSourceHost(), req.getHeader("X-Forwarded-For"));
        boolean isNonProxiedReqDifferent = req.getHeader("X-Forwarded-For") == null && ! SafetyUtil.equals(session.getSourceHost(), req.getRemoteHost());

        // e.g. isProxedReqDifferent will automatically be false if the request is non-proxied, that is why we use the logical OR operator
        if ( isProxiedReqDifferent || isNonProxiedReqDifferent ) {
          // If an existing session is reused with a different remote host then
          // logout the session and force a re-login.
          // logger.warning("Attempt to use session create for ", session.getRemoteHost(), " from ", req.getRemoteHost());
          // session.setContext(getX().put(Session.class, session));
          // session.setRemoteHost(req.getRemoteHost());
          // sessionDAO.put(session);
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

        if ( authenticate_ && ! auth.check(session.getContext(), "service." + spec.getName()) ) {
          logger.warning("Missing permission", group != null ? group.getId() : "NO GROUP" , "service." + spec.getName());
          msg.replyWithException(new AuthorizationException(String.format("You do not have permission to access the service named '%s'.", spec.getName())));
          return;
        }

        // padding this cause if group is null this can cause an NPE
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
      logger.error(t);
      t.printStackTrace();
      return;
    }

    getDelegate().send(msg);
  }
}
