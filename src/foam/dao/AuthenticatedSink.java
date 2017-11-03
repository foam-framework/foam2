/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import foam.core.Detachable;
import foam.core.FObject;
import foam.nanos.auth.AuthService;

import javax.security.auth.AuthPermission;
import java.security.Permission;

public class AuthenticatedSink
    extends ProxySink
{
  protected String name_;
  protected String method_;

  public AuthenticatedSink(String name, String method, Sink delegate) {
    this.name_ = name;
    this.method_ = method;
    setDelegate(delegate);
  }

  @Override
  public void put(FObject obj, Detachable sub) {
    AuthService authService = (AuthService) getX().get("auth");
    Permission permission = new AuthPermission(name_ + "." + method_ + "." + obj.getProperty("id"));
    if ( authService.check(getX(), permission) ) {
      super.put(obj, sub);
    }
  }

  @Override
  public void remove(FObject obj, Detachable sub) {
    AuthService authService = (AuthService) getX().get("auth");
    Permission permission = new AuthPermission(name_ + "." + method_ + "." + obj.getProperty("id"));
    if ( authService.check(getX(), permission) ) {
      super.remove(obj, sub);
    }
  }
}