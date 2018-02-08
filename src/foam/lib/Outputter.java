/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib;

import foam.core.FObject;

// not modelled because method with
// name stringify is not generated
public interface Outputter {
  String stringify(FObject obj);
}