/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.medusa;

import foam.box.Box;
import foam.box.HTTPBox;
import foam.box.Message;
import foam.box.MessageReplyBox;
import foam.box.RemoteException;
import foam.box.RPCErrorMessage;
import foam.core.*;
import foam.nanos.http.Ping;
import foam.nanos.http.PingService;
import foam.nanos.logger.Logger;
import java.io.PrintWriter;
import java.io.IOException;

/**
 * Differs from PingService by not responding unless instance is ONLINE
 */
public class ClusterPingService
  extends PingService
{
  public ClusterPingService() {}

  public void execute(X x) {
    ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
    ClusterConfig config = support.getConfig(x, support.getConfigId());
    PrintWriter out = x.get(PrintWriter.class);
    foam.lib.json.Outputter outputter =
      new foam.lib.json.Outputter(x)
      .setPropertyPredicate(new foam.lib.NetworkPropertyPredicate());
    Message msg = new Message();

    if ( config.getEnabled() &&
         config.getStatus() == Status.ONLINE ) {
      msg.setObject(new Ping());
    } else {
      Throwable t = new java.net.ConnectException("Connection refused: "+Status.OFFLINE.getLabel());
      RemoteException wrapper = new RemoteException();
      wrapper.setId(t.getClass().getName());
      wrapper.setMessage(t.getMessage());

      RPCErrorMessage reply = new RPCErrorMessage();
      reply.setData(wrapper);
      msg.setObject(reply);
    }
    out.println(outputter.stringify(msg));
  }
}
