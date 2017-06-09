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
  @Override
  public FObject get(X x) {
    AuthService authService = (AuthService) x.get("authService");
    java.security.Permission permission = new AuthPermission("." + getDelegate().get(x).getClassInfo().getId());
    if ( ! authService.check(x, permission) ) {
      return null;
    }
    return super.get(x);
  }

  @Override
  public void setProperty(X x, String name, Object value) {
    AuthService authService = (AuthService) x.get("authService");
    java.security.Permission permission = new AuthPermission("." + name);
    if ( ! authService.check(x, permission) ) {
      return;
    }
    super.setProperty(x, name, value);
  }

  @Override
  public void setProperties(X x, Map values) {
    AuthService authService = (AuthService) x.get("authService");
    for ( Object o : values.keySet() ) {
      String key = (String) o;
      java.security.Permission permission = new AuthPermission("." + key);
      if ( ! authService.check(x, permission) ) {
        return;
      }
    }
    super.setProperties(x, values);
  }
}
