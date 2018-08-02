/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import foam.box.RPCMessage;

/**
 * Extend the generated DAOSkeleton and map all non Context-Oriented methods
 * to their Context-Oriented equivalents. Ex.: from put() to put_().
 * This is so that the user's session is propogated to DAO calls.
 **/
public class SessionDAOSkeleton
  extends DAOSkeleton
{

  public void send(foam.box.Message message) {
    if ( ! ( message.getObject() instanceof foam.box.RPCMessage) ) {
      // TODO return an error?
      return;
    }

    RPCMessage rpc = (RPCMessage) message.getObject();
    String n = rpc.getName();

         if ( "put".equals(n)       ) { rpc.setName("put_"); }
    else if ( "remove".equals(n)    ) { rpc.setName("remove_"); }
    else if ( "find".equals(n)      ) { rpc.setName("find_"); }
    else if ( "select".equals(n)    ) { rpc.setName("select_"); }
    else if ( "removeAll".equals(n) ) { rpc.setName("removeAll_"); }
    else if ( "listen".equals(n)    ) { rpc.setName("listen_"); }
    else if ( "pipe".equals(n)      ) { rpc.setName("pipe_"); }
    else if ( "cmd".equals(n)       ) { rpc.setName("cmd_"); }

    super.send(message);
  }

}
