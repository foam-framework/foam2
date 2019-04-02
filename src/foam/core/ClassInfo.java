/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import java.util.List;

/** Provides runtime information about a Class. **/
// KGR: Why is this mutable?
public interface ClassInfo extends java.lang.Comparable {
  String      getId();
  ClassInfo   setId(String id);

  ClassInfo   getParent();
  ClassInfo   addAxiom(Axiom a);

  boolean     isInstance(Object o);
  Object      newInstance() throws IllegalAccessException, InstantiationException;

  ClassInfo   setObjClass(Class cls);
  Class       getObjClass();

  List        getAxioms();
  Object      getAxiomByName(String name);
  <T> List<T> getAxiomsByClass(Class<T> cls);
}
