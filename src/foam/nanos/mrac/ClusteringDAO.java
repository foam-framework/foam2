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

public class ClusterDAO extends ProxyDAO {

  QuorumService quorumService;
  String serviceName;

  public FObject put_(X x, FObject obj) {
    if ( quorumService.exposeState == InstanceState.PRIMARY ) {
      //TODO: persist
      return null;
    } else if ( quorumService.exposeState == InstanceState.SECONDARY ) {
      //TODO: call primary.
      return null;
    } else if ( quorumService.exposeState == InstanceState.ELECTING ) {
      throw new RuntimeException("Server re-election");
    } else {
      throw new RuntimeException("Error state. Can not serve");
    }
  }

  public FObject remove_(X x, FObject obj) {
    if ( quorumService.exposeState == InstanceState.PRIMARY ) {
      //TODO: persist
      return null;
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

}
