/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

/**
 * Method information objects are generated inside classes as data members,
 * to allow that class methods be called remotely through an ORBitalDAO.
 */
public abstract class MethodInfo implements Axiom, ClassInfoAware {

  protected ClassInfo parent;

  @Override
  public ClassInfo getClassInfo() {
    return parent;
  }

  @Override
  public MethodInfo setClassInfo(ClassInfo p) {
    parent = p;
    return this;
  }

  public abstract Object call(foam.core.X x, Object receiver, Object[] args);

}
