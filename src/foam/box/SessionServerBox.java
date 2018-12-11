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
import foam.nanos.boot.NSpec;
import foam.nanos.logger.*;
import foam.nanos.session.Session;
import java.util.Date;
import javax.naming.NoPermissionException;
import javax.servlet.http.HttpServletRequest;

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

    try {
      if ( sessionID != null ) {
        NSpec              spec       = getX().get(NSpec.class);
        HttpServletRequest req        = getX().get(HttpServletRequest.class);
        AuthService        auth       = (AuthService) getX().get("auth");
        DAO                sessionDAO = (DAO)         getX().get("sessionDAO");
        DAO                groupDAO   = (DAO)         getX().get("groupDAO");

        Session            session    = (Session)     sessionDAO.find(sessionID);

        if ( session == null ) {
          session = new Session();
          session.setId(sessionID);
          session.setRemoteHost(req.getRemoteHost());
          session.setContext(getX().put(Session.class, session));
        }

        User user = (User) session.getContext().get("user");
        X    x    = session.getContext().put(
            "logger",
            new PrefixLogger(
                new Object[] { user == null ? "" : user.getId() + " - " + user.label(), "[Service]", spec.getName() },
                (Logger) session.getContext().get("logger")))
          .put(HttpServletRequest.class, req);

        session.setLastUsed(new Date());
        session.setUses(session.getUses()+1);

        if ( authenticate_ && session.getUserId() == 0 ) {
          msg.replyWithException(new AuthenticationException());
          return;
        }

        if ( user != null ) {
          Group group = (Group) groupDAO.find(user.getGroup());

          if ( authenticate_ && ! auth.check(session.getContext(), "service." + spec.getName()) ) {
            logger.debug("missing permission", group != null ? group.getId() : "NO GROUP" , "service." + spec.getName());
            // msg.replyWithException(new NoPermissionException("No permission"));
            // return;
          }

          // padding this cause if group is null this can cause an NPE
          // technically the user shouldn't be created without a group
          if ( group != null ) {
            AppConfig appConfig = group.getAppConfig(x);
            x = x.put("appConfig", appConfig);
            session.getContext().put("appConfig", appConfig);
          } else {
            logger.error("missing group: ", String.format("User: [%d]", user.getId()));
            throw new RuntimeException("User without a group.");
          }
        }
        sessionDAO.put(session);
        msg.getLocalAttributes().put("x", x);
      }
    } catch (Throwable t) {
      logger.error(t);
      t.printStackTrace();
      return;
    }

    getDelegate().send(msg);
  }
}
