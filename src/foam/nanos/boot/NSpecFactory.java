/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.boot;

import foam.core.*;
import foam.nanos.*;

public class NSpecFactory
  implements XFactory
{
  NSpec  spec_;
  ProxyX x_;

  public NSpecFactory(ProxyX x, NSpec spec) {
    x_    = x;
    spec_ = spec;
  }

  public Object create(X x) {
    Object ns = null;

    try {
      ns = spec_.createService(x_.getX());

      if ( ns instanceof ContextAware ) ((ContextAware) ns).setX(x_);
      if ( ns instanceof NanoService  ) ((NanoService)  ns).start();
    } catch (Throwable t) {
      // TODO: LOG
      t.printStackTrace();
    }

    return ns;
  }
}
