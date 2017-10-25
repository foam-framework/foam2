/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.box;

import foam.core.*;

public class SessionServerBox
  extends ProxyBox
{

  // protected Map map_ = new LRULinkedHash
  public SessionServerBox(X x, Box delegate) {
    super(x, delegate);
  }

  public void send(Message msg) {
    String sessionID = (String) msg.getAttributes().get("sessionId");
    System.err.println("**** SESSIONID: " + sessionID);
    getDelegate().send(msg);
  }
}
