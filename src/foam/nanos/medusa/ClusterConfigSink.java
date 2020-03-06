/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.medusa;

import foam.core.Detachable;
import foam.core.FObject;
import foam.core.X;
import foam.dao.ProxySink;
import foam.dao.Sink;

public class ClusterConfigSink
  extends ProxySink
{
  protected ClusterConfigService service_;

  public ClusterConfigSink(X x, ClusterConfigService service) {
    setX(x);
    service_ = service;
  }

  @Override
  public void put(Object obj, Detachable sub) {
    service_.onDAOUpdate(getX());
  }

  @Override
  public void remove(Object obj, Detachable sub) {
    service_.onDAOUpdate(getX());
  }
}
