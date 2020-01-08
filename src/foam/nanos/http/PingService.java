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

public class PingService
  implements WebAgent
{


  public PingService() {}

  @Override
  public void execute(X x) {
    DAO clusterDAO = (DAO) x.get("clusterNodeDAO");
    String clusterId = System.getProperty("CLUSTER");

    if ( clusterDAO != null && (! "".equals(clusterId)) ) {
      Long id = Long.parseLong(clusterId);
      ClusterNode mySelf = (ClusterNode) clusterDAO.find_(x, id);
      NodeStatus status = null;
      if ( mySelf != null ) {
        status = new NodeStatus();
        status.setId(mySelf.getIp() + ":" + mySelf.getServicePort());
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
      }
      if ( status != null ) {
        Outputter outputter = new Outputter(x);
        String msg = outputter.stringify(status);
        PrintWriter out = x.get(PrintWriter.class);
        out.println(msg);
        return;
      }
    }
    PrintWriter out = x.get(PrintWriter.class);
    out.println("Pong: " + new Date());
  }
}
