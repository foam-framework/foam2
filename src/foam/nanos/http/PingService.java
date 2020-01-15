/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import foam.core.*;
import java.io.PrintWriter;
import java.util.Date;
import foam.dao.DAO;

import foam.nanos.mrac.quorum.*;
import foam.nanos.mrac.*;
import foam.lib.json.Outputter;
import static foam.mlang.MLang.*;
import foam.dao.ArraySink;
import java.util.List;

public class PingService
  implements WebAgent
{
  public PingService() {}

  @Override
  public void execute(X x) {
    DAO clusterDAO = (DAO) x.get("clusterNodeDAO");
    String hostname = System.getProperty("hostname");

    //TODO: refactor this if statement.
    if ( clusterDAO != null && (! "".equals(hostname)) ) {
      ClusterNode mySelf = null;

      ArraySink sink = (ArraySink) clusterDAO
                          .where(EQ(ClusterNode.HOST_NAME, hostname))
                          .select(new ArraySink());
      List list = sink.getArray();
      NodeStatus status = null;
      if ( list.size() == 1 ) mySelf = (ClusterNode) list.get(0);
      if ( mySelf != null ) {
        status = new NodeStatus();
        status.setId(mySelf.getId());
        status.setGroup(mySelf.getGroup());
        status.setHostName(mySelf.getIp() + ":" + mySelf.getServicePort());
        status.setInstanceType(mySelf.getType());
        status.setOnline(true);

        if ( mySelf.getGroup() != 1L ) {
          status.setIsMasterSlave(false);
          status.setQuorumStatus(InstanceState.NONE);
        } else {
          QuorumService quorumService = (QuorumService) x.get("quorumService");
          if ( quorumService != null ) {
            status.setIsMasterSlave(true);
            status.setQuorumStatus(quorumService.exposeState);
          } else {
            status.setIsMasterSlave(false);
            status.setQuorumStatus(InstanceState.NONE);
          }
        }
      } else {
        status = new NodeStatus();
        status.setId(-1);
      }
      if ( status != null ) {
        Outputter outputter = new Outputter(x);
        String msg = outputter.stringify(status);
        PrintWriter out = x.get(PrintWriter.class);
        out.println(msg);
        return;
      }
    }

    NodeStatus nStatus = new NodeStatus();
    nStatus.setId(-1);
    Outputter outputter = new Outputter(x);
    String msg = outputter.stringify(nStatus);
    PrintWriter out = x.get(PrintWriter.class);
    out.println(msg);

    // PrintWriter out = x.get(PrintWriter.class);
    // out.println("Pong: " + new Date());
  }
}
