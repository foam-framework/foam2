/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

public interface MethodInfo extends Axiom {

  public ClassInfo getClassInfo();
  public MethodInfo setClassInfo(ClassInfo p);

//  public boolean getPermissionRequired();
//  public void authorize(foam.core.X x);

  public Object call(foam.core.X x, Object receiver, Object[] args);

}
