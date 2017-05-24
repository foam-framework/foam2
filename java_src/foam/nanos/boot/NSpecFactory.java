/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.boot;

import foam.core.*;

public class NSpecFactory implements XFactory {
  public NSpecFactory(NSpec spec);

  public Object create(X x) {
    NanoService ns = spec.createService();
    ns.setX(x);
    ns.start();
    
    return ns;
  }
}
