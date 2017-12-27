/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.box;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.AuthService;
import foam.nanos.boot.NSpec;
import foam.nanos.session.Session;

import javax.naming.NoPermissionException;
import javax.servlet.http.HttpServletRequest;
import java.security.AccessControlException;
import java.util.Date;

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

    try {
      if ( sessionID != null ) {
        NSpec       spec       = (NSpec)       getX().get(NSpec.class);
        AuthService auth       = (AuthService) getX().get("auth");
        DAO         sessionDAO = (DAO)         getX().get("sessionDAO");
        Session     session    = (Session)     sessionDAO.find(sessionID);

        if ( session == null ) {
          session = new Session();
          session.setId(sessionID);

          HttpServletRequest req = (HttpServletRequest) getX().get(HttpServletRequest.class);
          session.setRemoteHost(req.getRemoteHost());
          session.setContext(getX().put(Session.class, session));
        }

        session.setLastUsed(new Date());
        session.setUses(session.getUses()+1);

        sessionDAO.put(session);

        if ( authenticate_ && session.getUserId() == 0 ) {
          msg.replyWithException(new AccessControlException("Not logged in"));
          return;
        }

        /*
        Temporarily work around service check.
        if ( authenticate_ && ! auth.check(session.getContext(), "service." + spec.getName()) ) {
          msg.replyWithException(new NoPermissionException("No permission"));
          return;
        }
        */

        msg.getLocalAttributes().put("x", session.getContext());
      }
    } catch (Throwable t) {
      t.printStackTrace();
    }

    getDelegate().send(msg);
  }
}
