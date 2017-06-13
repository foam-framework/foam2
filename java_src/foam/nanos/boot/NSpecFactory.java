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
  NSpec spec_;

  public NSpecFactory(NSpec spec) {
    spec_ = spec;
  }

  public Object create(X x) {
    Object ns = null;

    try {
      ns = spec_.createService();

      if ( ns instanceof ContextAware ) ((ContextAware) ns).setX(x);
      if ( ns instanceof NanoService  ) ((NanoService)  ns).start();
    } catch (ClassNotFoundException e) {
      e.printStackTrace();
    } catch (InstantiationException e) {
      e.printStackTrace();
    } catch (IllegalAccessException e) {
      e.printStackTrace();
    }

    return ns;
  }
}
