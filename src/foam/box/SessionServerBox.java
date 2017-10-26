/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.box;

import foam.core.*;
import foam.dao.*;
import foam.nanos.session.Session;
import java.util.Date;
import javax.servlet.http.HttpServletRequest;


public class SessionServerBox
  extends ProxyBox
{

  public SessionServerBox(X x, Box delegate) {
    super(x, delegate);
    System.err.println("*** creating session server box");
  }

  public void send(Message msg) {
    String sessionID = (String) msg.getAttributes().get("sessionId");

    try {

      if ( sessionID != null ) {
        System.err.println("**** SESSIONID: " + sessionID);

        DAO     dao     = (DAO) getX().get("sessionDAO");
        Session session = (Session) dao.find(sessionID);

        if ( session == null ) {
          session = new Session();
          session.setId(sessionID);

          HttpServletRequest req = (HttpServletRequest) getX().get(HttpServletRequest.class);
          session.setRemoteHost(req.getRemoteHost());
        }

        session.setLastUsed(new Date());
        session.setUses(session.getUses()+1);

        dao.put(session);
      }
    } catch (Throwable t) {
      t.printStackTrace();
    }

    getDelegate().send(msg);
  }
}
