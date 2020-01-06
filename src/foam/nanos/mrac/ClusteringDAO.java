/**
* @license
* Copyright 2020 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/
package foam.nanos.mrac;

import foam.nanos.mrac.quorum.*;
import foam.dao.ProxyDAO;
import foam.core.FObject;
import foam.core.X;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.lib.json.Outputter;
import foam.lib.ClusterPropertyPredicate;
import foam.dao.DAO;

//TODO: create a MedusaClusterConfigService.
public class ClusteringDAO extends ProxyDAO {

  QuorumService quorumService;
  String serviceName;
  //Must be the same instance as the one being put in JDAO
  DAO mdao;

  public ClusteringDAO(X x, String serviceName, DAO mdao) {
    setX(x);
    this.serviceName = serviceName;
    this.mdao = mdao;
  }

  public FObject put_(X x, FObject obj) {
    if ( quorumService.exposeState == InstanceState.PRIMARY ) {
      return getDelegate().put_(x, obj);
    } else if ( quorumService.exposeState == InstanceState.SECONDARY ) {
      return forwardPutToPrimary(x, obj);
    } else if ( quorumService.exposeState == InstanceState.ELECTING ) {
      throw new RuntimeException("Server re-election");
    } else {
      throw new RuntimeException("Error state. Can not serve");
    }
  }

  public FObject remove_(X x, FObject obj) {
    if ( quorumService.exposeState == InstanceState.PRIMARY ) {
      return getDelegate().remove_(x, obj);
    } else if ( quorumService.exposeState == InstanceState.SECONDARY ) {
      //TODO: call primary.
      return null;
    } else if ( quorumService.exposeState == InstanceState.ELECTING ) {
      throw new RuntimeException("Server re-election");
    } else {
      throw new RuntimeException("Error state. Can not serve");
    }
  }

  public void removeAll_(foam.core.X x, long skip, long limit, foam.mlang.order.Comparator order, foam.mlang.predicate.Predicate predicate) {
    throw new RuntimeException("Implements");
  }

  private FObject forwardPutToPrimary(X x, FObject obj) {

    //TODO: inject mdao.
    Outputter outputter = new Outputter(x).setPropertyPredicate(new ClusterPropertyPredicate());
    String record = outputter.stringify(obj);

    ClusterCommand cmd = new ClusterCommand(x, serviceName, ClusterCommand.PUT, record);
    //TODO: create request to Primary.
    ClusterNode primaryClusterNode = quorumService.getPrimaryClusterNode();


    FObject result = null;
    obj = obj.copyFrom(result);
    return mdao.put_(x, obj);
  }

}
