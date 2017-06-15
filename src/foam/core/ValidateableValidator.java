/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import foam.core.*;

public class ValidateableValidator {
  private static ValidateableValidator instance_ = new ValidateableValidator();

  public static ValidateableValidator instance() { return instance_; }

  private ValidateableValidator() {}

  public static void validate(Object obj) throws IllegalStateException {
    ((Validateable)obj).validate();
  }
}
