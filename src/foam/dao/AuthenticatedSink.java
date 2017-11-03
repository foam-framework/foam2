/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import foam.core.Detachable;
import foam.core.FObject;
import foam.core.X;
import foam.nanos.auth.AuthService;

import javax.security.auth.AuthPermission;
import java.security.Permission;

public class AuthenticatedSink
    extends ProxySink
{
  protected String prefix_;
  protected String method_;

  public AuthenticatedSink(X x, String name, String method, Sink delegate) {
    setX(x);
    setDelegate(delegate);
    this.prefix_ = name + "." + method + ".";
  }

  @Override
  public void put(FObject obj, Detachable sub) {
    AuthService authService = (AuthService) getX().get("auth");
    Permission permission = new AuthPermission(prefix_ + obj.getProperty("id"));
    if ( authService.check(getX(), permission) ) {
      super.put(obj, sub);
    }
  }

  @Override
  public void remove(FObject obj, Detachable sub) {
    AuthService authService = (AuthService) getX().get("auth");
    Permission permission = new AuthPermission(prefix_ + obj.getProperty("id"));
    if ( authService.check(getX(), permission) ) {
      super.remove(obj, sub);
    }
  }
}