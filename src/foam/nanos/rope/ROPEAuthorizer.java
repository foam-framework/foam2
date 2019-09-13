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
import foam.nanos.auth.User;

public class ROPEAuthorizer implements Authorizer {

  public ROPEAuthorizer() {}

  public void authorizeOnCreate(X x, FObject obj) throws AuthorizationException {
    User user = (User) x.get("user");
    String targetModel = obj.getClassInfo().getId();
    if ( ! relationshipTreeSearch(targetModel, "C") ) throw new AuthorizationException("You don't have permission to create this object");
  }

  public void authorizeOnRead(X x, FObject obj) throws AuthorizationException {
    User user = (User) x.get("user");
    String targetModel = obj.getClassInfo().getId();
    if ( ! relationshipTreeSearch(targetModel, "R") ) throw new AuthorizationException("You don't have permission to create this object");
  }

  public void authorizeOnUpdate(X x, FObject oldObj, FObject obj) throws AuthorizationException {
    User user = (User) x.get("user");
    String targetModel = obj.getClassInfo().getId();
    if ( ! relationshipTreeSearch(targetModel, "U") ) throw new AuthorizationException("You don't have permission to create this object");
  }

  public void authorizeOnDelete(X x, FObject obj) throws AuthorizationException {
    User user = (User) x.get("user");
    String targetModel = obj.getClassInfo().getId();
    if ( ! relationshipTreeSearch(targetModel, "D") ) throw new AuthorizationException("You don't have permission to create this object");
  }

  public boolean relationshipTreeSearch(String targetModel, String operation) {
    return false;
  }

  public boolean checkGlobalRead(X x) {
    return false;
  }

  public boolean checkGlobalRemove(X x) {
    return false;
  }

}