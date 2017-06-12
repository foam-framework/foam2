/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.auth;

import foam.core.FObject;
import foam.core.X;
import foam.oao.ProxyOAO;

import javax.security.auth.AuthPermission;
import java.util.Map;

public class AuthOAO
  extends ProxyOAO
{
  protected String rootPermission_ = null;

  public AuthOAO(String rootPermission_) {
    this.rootPermission_ = rootPermission_;
  }

  protected String getRootPermission_(X x) {
    return rootPermission_ == null ? getDelegate().get(x).getClassInfo().getId() : rootPermission_;
  }

  private Boolean checkPermission_(X x, AuthService authService, String name) {
    java.security.Permission permission = new AuthPermission(getRootPermission_(x) + "." + name);
    return authService.check(x, permission);
  }

  @Override
  public FObject get(X x) {
    AuthService authService = (AuthService) x.get("authService");
    java.security.Permission permission = new AuthPermission(getRootPermission_(x));
    if ( ! authService.check(x, permission) ) {
      // TODO figure out what to do here
      return null;
    }
    return super.get(x);
  }

  @Override
  public FObject setProperty(X x, String name, Object value) {
    AuthService authService = (AuthService) x.get("authService");
    if ( ! checkPermission_(x, authService, name) ) {
      // TODO figure out what to do here
      return null;
    }
    return super.setProperty(x, name, value);
  }

  @Override
  public FObject setProperties(X x, Map values) {
    AuthService authService = (AuthService) x.get("authService");
    for ( Object o : values.keySet() ) {
      if ( ! checkPermission_(x, authService, (String) o) ) {
        // TODO figure out what to do here
        return null;
      }
    }
    return super.setProperties(x, values);
  }
}
