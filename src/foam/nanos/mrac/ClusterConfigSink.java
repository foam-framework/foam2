/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.mrac;

import foam.core.Detachable;
import foam.core.FObject;
import foam.core.X;
import foam.dao.ProxySink;
import foam.dao.Sink;

public class ClusterConfigSink
  extends ProxySink
{
  protected ClusterDAO cluster_;

  public ClusterConfigSink(X x, ClusterDAO cluster) {
    setX(x);
    cluster_ = cluster;
  }

  @Override
  public void put(Object obj, Detachable sub) {
    cluster_.reconfigure(getX());
  }

  @Override
  public void remove(Object obj, Detachable sub) {
    cluster_.reconfigure(getX());
  }
}
