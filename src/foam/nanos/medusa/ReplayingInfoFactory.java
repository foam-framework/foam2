/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.nanos.medusa;

import foam.core.X;
import foam.core.XFactory;

public class ReplayingInfoFactory
  implements XFactory {

  public Object create(X x) {
    ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
    ClusterConfig config = support.getConfig(x, support.getConfigId());
    ReplayingInfo info = new ReplayingInfo();
    config.setReplayingInfo(info);
    config = (ClusterConfig) ((foam.dao.DAO) x.get("localClusterConfigDAO")).put_(x, config);
    return config.getReplayingInfo();
  }
}
