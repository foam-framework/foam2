/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

/**
 * An interface for axioms that have information about their own class.
 */
public interface ClassInfoAware {

  ClassInfo getClassInfo();

  // The return type here is Axiom because only Axioms can be ClassInfoAware,
  // If this changes in the future, this return type would need to change
  Axiom setClassInfo(ClassInfo p);

}
