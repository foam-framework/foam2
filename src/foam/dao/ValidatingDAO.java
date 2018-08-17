/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import foam.core.*;

public class ValidatingDAO
    extends ProxyDAO
{
  protected Validator validator_;

  public ValidatingDAO(X x, DAO delegate) {
    this(x, delegate, ValidatableValidator.instance());
  }

  public ValidatingDAO(X x, DAO delegate, Validator validator) {
    setX(x);
    setDelegate(delegate);
    validator_ = validator;
  }

  public FObject put_(X x, FObject obj) throws IllegalStateException {
    validator_.validate(x, obj);
    return super.put_(x, obj);
  }
}
