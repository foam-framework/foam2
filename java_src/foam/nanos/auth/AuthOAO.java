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
  protected final String rootPermission_;

  public AuthOAO() {
    this.rootPermission_ = getClass().getSimpleName();
  }

  public AuthOAO(String rootPermission) {
    this.rootPermission_ = rootPermission;
  }

  @Override
  public FObject get(X x) throws IllegalAccessException {
    AuthService authService = (AuthService) x.get("authService");
    java.security.Permission permission = new AuthPermission(rootPermission_ + "." + getDelegate().get(x).getClassInfo().getId());
    if ( ! authService.check(x, permission) ) {
      throw new IllegalAccessException("Invalid permissions");
    }
    return super.get(x);
  }

  @Override
  public void setProperty(X x, String name, Object value) throws IllegalAccessException {
    AuthService authService = (AuthService) x.get("authService");
    java.security.Permission permission = new AuthPermission(rootPermission_ + "." + name);
    if ( ! authService.check(x, permission) ) {
      throw new IllegalAccessException("Invalid permissions");
    }
    super.setProperty(x, name, value);
  }

  @Override
  public void setProperties(X x, Map values) throws IllegalAccessException {
    AuthService authService = (AuthService) x.get("authService");
    for ( Object o : values.keySet() ) {
      String key = (String) o;
      java.security.Permission permission = new AuthPermission(rootPermission_ + "." + key);
      if ( ! authService.check(x, permission) ) {
        throw new IllegalAccessException("Invalid permissions");
      }
    }
    super.setProperties(x, values);
  }
}
