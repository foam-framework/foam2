/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import foam.core.*;
import java.lang.IllegalStateException;

public class ValidateableValidator {
  private static ValidateableValidator sharedInstance = new ValidateableValidator();

  public static ValidateableValidator getInstance() { return sharedInstance; }

  private ValidateableValidator() {}

  public static void validate(Object obj) throws IllegalStateException {
    (Validateable)obj.validate();
  }
}
