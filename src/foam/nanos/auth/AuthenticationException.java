/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.auth;

/**
 * Throw this when a user is not logged in.
 */
public class AuthenticationException extends SecurityException {
  public AuthenticationException() {
    super("User is not logged in.");
  }
  public AuthenticationException(String message) {
    super(message);
  }
}
