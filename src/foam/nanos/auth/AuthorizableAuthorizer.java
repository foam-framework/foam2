/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.auth;

import foam.core.FObject;
import foam.core.X;

public class AuthorizableAuthorizer implements Authorizer {
  private static AuthorizableAuthorizer instance_ = null;

  public static AuthorizableAuthorizer instance() {
    if ( instance_ == null ) {
      instance_ = new AuthorizableAuthorizer();
    }
    return instance_;
  }

  private AuthorizableAuthorizer() {}

  public void authorizeOnCreate(X x, FObject obj) throws AuthorizationException {
    if ( obj instanceof Authorizable ) {
      ((Authorizable) obj).authorizeOnCreate(x);
    }
  }

  public void authorizeOnRead(X x, FObject obj) throws AuthorizationException {
    if ( obj instanceof Authorizable ) {
      ((Authorizable) obj).authorizeOnRead(x);
    }
  }

  public void authorizeOnUpdate(X x, FObject oldObj, FObject obj) throws AuthorizationException {
    if ( obj instanceof Authorizable ) {
      ((Authorizable) obj).authorizeOnUpdate(x, oldObj);
    }
  }

  public void authorizeOnDelete(X x, FObject obj) throws AuthorizationException {
    if ( obj instanceof Authorizable ) {
      ((Authorizable) obj).authorizeOnDelete(x);
    }
  }
}
