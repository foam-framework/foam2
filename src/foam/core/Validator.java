/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

public interface Validator {
  public void validate(X x, foam.core.FObject obj) throws IllegalStateException;
}
