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

public class StandardAuthorizer implements Authorizer {

  private String name;

  public StandardAuthorizer(String name) {
    this.name = name;
  }

  public String createPermission(String op) {
    return name + "." + op;
  }

  public String createPermission(String op, Object id) {
    return name + "." + op + "." + id;
  }

  public String getPermissionPrefix() {
    return this.name;
  }

  public void authorizeOnCreate(X x, FObject obj) throws AuthorizationException {

    String permission = createPermission("create");
    AuthService authService = (AuthService) x.get("auth");

    if ( ! authService.check(x, permission) ) {
      throw new AuthorizationException();
    }
  }

  public void authorizeOnRead(X x, FObject obj) throws AuthorizationException {

    String permission = createPermission("read", obj.getProperty("id"));
    AuthService authService = (AuthService) x.get("auth");
    
    if ( ! authService.check(x, permission) ) {
      throw new AuthorizationException();
    }
  }

  public void authorizeOnUpdate(X x, FObject oldObj, FObject obj) throws AuthorizationException {

    String permission = createPermission("update", obj.getProperty("id"));
    AuthService authService = (AuthService) x.get("auth");
    
    if ( ! authService.check(x, permission) ) {
      throw new AuthorizationException();
    }
  }

  public void authorizeOnDelete(X x, FObject obj) throws AuthorizationException {

    String permission  = createPermission("remove", obj.getProperty("id"));
    AuthService authService = (AuthService) x.get("auth");
    
    if ( ! authService.check(x, permission) ) {
      throw new AuthorizationException();
    }
  }

  public boolean checkGlobalRead(X x) {
    String permission = createPermission("read");
    AuthService authService = (AuthService) x.get("auth");
    try {
      return authService.check(x, permission);
    } catch ( Exception e ) {
      return false;
    }
  }

  public boolean checkGlobalRemove(X x) {
    String permission = createPermission("remove");
    AuthService authService = (AuthService) x.get("auth");
    try {
      return authService.check(x, permission);
    } catch ( Exception e ) {
      return false;
    }

  }
}