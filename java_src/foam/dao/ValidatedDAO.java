/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import foam.core.Validator;

import foam.dao.*;
import foam.core.*;
import java.lang.IllegalStateException;

public class ValidatedDAO
  extends ProxyDAO
  implements Validator
{
  public void validate(FObject obj) throws IllegalStateException {
    (Validateable)obj.validate();
  }

  public FObject put(FObject value) throws IllegalStateException {
    this.validate(value);
    return super.put(value);
  }
}
