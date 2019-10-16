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
  private CapabilityRequiredRemoteException capabilityRequired_;

  public AuthorizationException() {
    super("Permission denied.");
  }
  public AuthorizationException(CapabilityRequiredRemoteException r) {
    super("Capability required.");
    capabilityRequired_ = r;
  }
  public AuthorizationException(String message) {
    super(message);
  }

  public CapabilityRequiredRemoteException getCapabilityRequired() {
    return capabilityRequired_;
  }

  public boolean hasCapabilityRequired() {
    return capabilityRequired_ != null;
  }
}
