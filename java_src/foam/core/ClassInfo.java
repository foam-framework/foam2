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

  boolean isInstance(Object o);
  Object newInstance();

  ClassInfo setObjClass(Class cls);
  Class     getObjClass();

  List      getAxioms();
  Object    getAxiomByName(String name);
  List      getAxiomsByClass(Class cls);
}
