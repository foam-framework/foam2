/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

public class ValidatableValidator
  implements Validator
{
  private static ValidatableValidator instance_ = null;

  public static ValidatableValidator instance() {
    if ( instance_ == null ) {
      instance_ = new ValidatableValidator();
    }
    return instance_;
  }

  private ValidatableValidator() {}

  public void validate(X x, FObject obj) throws IllegalStateException {
    if ( obj instanceof Validatable ) {
      ((Validatable) obj).validate(x);
    }
  }
}
