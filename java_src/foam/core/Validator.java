/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import foam.core.*;

public interface Validator {
  public void validate(FObject obj) throws IllegalStateException;
}
