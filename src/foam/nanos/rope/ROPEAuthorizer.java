/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.rope;

import foam.core.FObject;
import foam.core.X;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.AuthorizationException;
import foam.nanos.auth.Authorizer;

public class ROPEAuthorizer implements Authorizer {

  public ROPEAuthorizer() {
  }

  public void authorizeOnCreate(X x, FObject obj) throws AuthorizationException {
  }

  public void authorizeOnRead(X x, FObject obj) throws AuthorizationException {
  }

  public void authorizeOnUpdate(X x, FObject oldObj, FObject obj) throws AuthorizationException {
  }

  public void authorizeOnDelete(X x, FObject obj) throws AuthorizationException {
  }

  public boolean checkGlobalRead(X x) {
    return false;
  }

  public boolean checkGlobalRemove(X x) {
    return false;
  }

}