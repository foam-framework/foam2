/**
* @license
* Copyright 2020 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/
package foam.nanos.medusa;

import foam.nanos.medusa.quorum.*;
import foam.dao.ProxyDAO;
import foam.core.FObject;
import foam.core.X;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.lib.json.Outputter;
import foam.lib.ClusterPropertyPredicate;
import foam.dao.DAO;
import foam.box.HTTPBox;
import foam.box.HTTPAuthorizationType;
import foam.box.SessionClientBox;
import foam.dao.ClientDAO;

import java.net.URI;

//TODO: create a MedusaClusterConfigService.
public class VotingDAO extends ProxyDAO {

  QuorumService quorumService;
  volatile boolean isReady;
  public VotingDAO(X x, DAO delegate) {
    setX(x);
    QuorumService quorumService = (QuorumService) x.get("quorumService");
    if ( quorumService == null ) throw new RuntimeException("Can not find quorumService");
    this.quorumService = quorumService;
    setDelegate(delegate);
  }

  public FObject put_(X x, FObject obj) {
    if ( quorumService.exposeState == InstanceState.PRIMARY ) {
      DefaultClusterConfigService service = new VotingClusterConfigService(
                                                  x,
                                                  true,
                                                  quorumService.mySelf,
                                                  quorumService.mySelf
                                                );
      X x1 = x.put("clusterConfigService", service);
      return getDelegate().put_(x1, obj);
    } else if ( quorumService.exposeState == InstanceState.SECONDARY ) {
      ClusterNode primaryClusterNode = quorumService.getPrimaryClusterNode();
      if ( primaryClusterNode == null ) throw new RuntimeException("No Primary");
      DefaultClusterConfigService service = new VotingClusterConfigService(
                                                  x,
                                                  false,
                                                  quorumService.mySelf,
                                                  primaryClusterNode
                                                );
      X x1 = x.put("clusterConfigService", service);
      return getDelegate().put_(x1, obj);
    } else if ( quorumService.exposeState == InstanceState.ELECTING ) {
      throw new RuntimeException("Server re-election");
    } else {
      throw new RuntimeException("Error state. Can not serve");
    }
  }

  public FObject remove_(X x, FObject obj) {
    if ( quorumService.exposeState == InstanceState.PRIMARY ) {
      DefaultClusterConfigService service = new VotingClusterConfigService(
                                                  x,
                                                  true,
                                                  quorumService.mySelf,
                                                  quorumService.mySelf
                                                );
      X x1 = x.put("clusterConfigService", service);
      return getDelegate().remove_(x1, obj);
    } else if ( quorumService.exposeState == InstanceState.SECONDARY ) {
      ClusterNode primaryClusterNode = quorumService.getPrimaryClusterNode();
      if ( primaryClusterNode == null ) throw new RuntimeException("No Primary");
      DefaultClusterConfigService service = new VotingClusterConfigService(
                                                  x,
                                                  false,
                                                  quorumService.mySelf,
                                                  primaryClusterNode
                                                );
      X x1 = x.put("clusterConfigService", service);
      return getDelegate().remove_(x1, obj);
    } else if ( quorumService.exposeState == InstanceState.ELECTING ) {
      throw new RuntimeException("Server re-election");
    } else {
      throw new RuntimeException("Error state. Can not serve");
    }
  }

  public void removeAll_(foam.core.X x, long skip, long limit, foam.mlang.order.Comparator order, foam.mlang.predicate.Predicate predicate) {
    throw new RuntimeException("!!!!!!removeAll_ do not implement");
  }

  //public Object cmd_(X x, Object obj) {
  //  //TODO: create clusterConfigServer into x;
  //  if ( ! ( obj instanceof ClusterCommand ) ) {
  //    throw new RuntimeException("obj should be an instance of ClusterCommand");
  //  }

  //  if ( quorumService.exposeState != InstanceState.PRIMARY ) {
  //    throw new RuntimeException("Instance");
  //  }
  //  return null;
  //}

  //TODO: this class should be generate from election.java
  private class VotingClusterConfigService
    extends DefaultClusterConfigService
  {
    public VotingClusterConfigService(X x, boolean isPrimary, ClusterNode mySelf, ClusterNode primaryClusterNode) {
      setX(x);
      this.setIsPrimary(isPrimary);
      ClusterConfig config = new ClusterConfig();
      config.setSessionId(mySelf.getSessionId());
      ClusterConfig primary = new ClusterConfig();
      primary.setId(primaryClusterNode.getIp());
      primary.setPort(primaryClusterNode.getServicePort());
      this.setConfig(config);
      this.setPrimaryConfig(primary);
    }

  }
}
