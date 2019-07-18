/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.nanos.auth;

import foam.core.X;
import foam.nanos.auth.User;

public class SystemAuthService
  extends ProxyAuthService
{
  public SystemAuthService(AuthService delegate) {
    setDelegate(delegate);
  }

  @Override
  public boolean check(foam.core.X x, String permission) {
    User user = (User) x.get("user");
    return ( user != null && user.getId() == 1 ) ? true :  getDelegate().check(x, permission);
  }
}
