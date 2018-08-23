/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.auth;

/**
 * Throw this when a user is logged in, but is not permitted to do something.
 */
public class AuthorizationException extends SecurityException {
  public AuthorizationException() {
    super("Permission denied.");
  }
  public AuthorizationException(String message) {
    super(message);
  }
}
