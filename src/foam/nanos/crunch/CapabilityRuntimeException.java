/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.nanos.crunch;

import java.util.ArrayList;
import foam.nanos.auth.AuthorizationException;

public class CapabilityRuntimeException extends AuthorizationException {
  private ArrayList<String> capabilities;

  private void init() {
    capabilities = new ArrayList<String>();
  }

  public CapabilityRuntimeException() {
    super();
    init();
  }

  public CapabilityRuntimeException(String message) {
    super(message);
    init();
  }

  public String[] getCapabilities() {
    return capabilities.toArray(new String[capabilities.size()]);
  }

  public void addCapabilityId(String capabilityId) {
    capabilities.add(capabilityId);
  }
}