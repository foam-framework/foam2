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

  // Auth service decorator put at beginning of chain to always return true for system user
  // Prevent stackoverflows caused by auth checks done during build

  public SystemAuthService(AuthService delegate) {
    setDelegate(delegate);
  }

  @Override
  public boolean check(foam.core.X x, String permission) {
    User user = (User) x.get("user");
    return ( user != null && user.getId() == 1 ) || getDelegate().check(x, permission);
  }
}
