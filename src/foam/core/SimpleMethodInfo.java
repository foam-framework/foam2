/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import foam.nanos.auth.AuthService;
import foam.nanos.auth.AuthorizationException;

public abstract class SimpleMethodInfo implements MethodInfo
{
  protected ClassInfo parent;
  protected String name;

  public SimpleMethodInfo(){

  }

  @Override
  public ClassInfo getClassInfo() {
    return parent;
  }

  @Override
  public MethodInfo setClassInfo(ClassInfo p) {
    parent = p;
    return this;
  }

  @Override
  public String getName() {
    return name;
  }

  @Override
  public void setName(String name) {
    this.name = name;
  }

  @Override
  public Object get(Object o) {
    return getName();
  }

  @Override
  public void set(Object o, Object value) {
    setName((String)value);
  }

  @Override
  public boolean getPermissionRequired() {
    return true;   // TODO: To be improved
  }

  @Override
  public void authorize(X x) {
    if ( this.getPermissionRequired() ) {
      AuthService auth = (AuthService) x.get("auth");
      String simpleName = this.getClassInfo().getObjClass().getSimpleName();
      String permission =
        simpleName.toLowerCase() +
          ".%s." +
          this.getName().toLowerCase();

      if ( ! auth.check(x, String.format(permission, "exec")) )
        throw new AuthorizationException(String.format("Access denied. User lacks permission to execute command '%s' on model '%s'.", this.getName(), simpleName));
    }
  }

  public String toString(){
    return "_SimpleMethodInfo:" + getName();
  }

}
