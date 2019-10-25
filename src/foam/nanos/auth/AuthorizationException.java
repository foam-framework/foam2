/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.auth;
import foam.box.CapabilityRequiredRemoteException;

/**
 * Throw this when a user is logged in, but is not permitted to do something.
 */
public class AuthorizationException extends SecurityException {
  // TODO: This should be decoupled from AuthorizationException after
  //       the modelled exception feature is merged.
  protected String permission_;

  public AuthorizationException() {
    super("Permission denied.");
  }
  public AuthorizationException(String message, String permission) {
    super("".equals(message) ? "Permission denied." : message);
    permission_ = permission;
  }
  public AuthorizationException(String message) {
    super(message);
  }

  public String getPermission() {
    return permission_;
  }

  public void clearPermission() {
    permission_ = "";
  }
}
