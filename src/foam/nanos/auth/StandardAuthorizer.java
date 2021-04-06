/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.auth;

import foam.core.FObject;
import foam.core.X;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.AuthorizationException;
import foam.mlang.predicate.Predicate;

public class StandardAuthorizer implements Authorizer {

  // Standard authorizer to be used for authorization on object not implementing the authorizable interface
  // Performs authorization by checking permission generated from permissionPrefix passed in

  protected String permissionPrefix_ = "";

  public StandardAuthorizer(String permissionPrefix) {
    permissionPrefix_ = permissionPrefix;
  }

  public String createPermission(String op) {
    return permissionPrefix_ + "." + op;
  }

  public String createPermission(String op, Object id) {
    return permissionPrefix_ + "." + op + "." + id.toString();
  }

  public void authorizeOnCreate(X x, FObject obj) throws AuthorizationException {

    String permission = createPermission("create");
    AuthService authService = (AuthService) x.get("auth");
    if ( ! authService.check(x, permission) ) {
      ((foam.nanos.logger.Logger) x.get("logger")).debug("StandardAuthorizer", "Permission denied", permission);
      throw new AuthorizationException();
    }
  }

  public void authorizeOnRead(X x, FObject obj) throws AuthorizationException {

    String permission = createPermission("read", obj.getProperty("id"));
    AuthService authService = (AuthService) x.get("auth");

    if ( ! authService.check(x, permission) ) {
      ((foam.nanos.logger.Logger) x.get("logger")).debug("StandardAuthorizer", "Permission denied", permission);
      throw new AuthorizationException();
    }
  }

  public void authorizeOnUpdate(X x, FObject oldObj, FObject obj) throws AuthorizationException {

    String permission = createPermission("update", obj.getProperty("id"));
    AuthService authService = (AuthService) x.get("auth");

    if ( ! authService.check(x, permission) ) {
      ((foam.nanos.logger.Logger) x.get("logger")).debug("StandardAuthorizer", "Permission denied", permission);
      throw new AuthorizationException();
    }
  }

  public void authorizeOnDelete(X x, FObject obj) throws AuthorizationException {

    String permission  = createPermission("remove", obj.getProperty("id"));
    AuthService authService = (AuthService) x.get("auth");

    if ( ! authService.check(x, permission) ) {
      ((foam.nanos.logger.Logger) x.get("logger")).debug("StandardAuthorizer", "Permission denied", permission);
      throw new AuthorizationException();
    }
  }

  public boolean checkGlobalRead(X x, Predicate predicate) {
    String permission = createPermission("read", "*");
    AuthService authService = (AuthService) x.get("auth");
    try {
      return authService.check(x, permission);
    } catch ( AuthorizationException e ) {
      return false;
    }
  }

  public boolean checkGlobalRemove(X x) {
    String permission = createPermission("remove", "*");
    AuthService authService = (AuthService) x.get("auth");
    try {
      return authService.check(x, permission);
    } catch ( AuthorizationException e ) {
      return false;
    }

  }
}
