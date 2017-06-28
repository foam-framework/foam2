/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;

/** Provides runtime information about a Class. **/
// KGR: Why is this mutable?
public interface ClassInfo {
  String    getId();
  ClassInfo setId(String id);

  ClassInfo getParent();
  ClassInfo addProperty(PropertyInfo p);

  boolean   isInstance(Object o);
  Object    newInstance() throws IllegalAccessException, InstantiationException;

  ClassInfo setObjClass(Class cls);
  Class     getObjClass();

  List      getAxioms();
  Object    getAxiomByName(String name);
  List      getAxiomsByClass(Class cls);
}
