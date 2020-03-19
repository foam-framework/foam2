/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.medusa;

import foam.core.Detachable;
import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxySink;
import foam.dao.Sink;
import foam.nanos.logger.Logger;

public class ClusterConfigSink
  extends ProxySink
{
  protected MMJournal mm_;

  public ClusterConfigSink(X x, MMJournal mm) {
    setX(x);
    mm_ = mm;
  }

  @Override
  public void put(Object obj, Detachable sub) {
    ClusterConfigService service = (ClusterConfigService) getX().get("clusterConfigService");
    ClusterConfig nu = (ClusterConfig) obj;
    ((Logger) getX().get("logger")).debug(this.getClass().getSimpleName(), "put", nu.getId(), nu.getIsPrimary(), "service", service.getConfigId(), service.getIsPrimary());
    if ( service.getIsPrimary() ) {
      mm_.primary(getX());
    } else {
      mm_.secondary(getX());
    }
  }

  @Override
  public void remove(Object obj, Detachable sub) {
    // nop
  }
}
