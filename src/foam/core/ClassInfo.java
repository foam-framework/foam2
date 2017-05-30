package foam.core;

import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;

/** Provides runtime information about a Class. **/
// KGR: Why is this mutable?
public interface ClassInfo {
  public String    getId();
  public ClassInfo setId(String id);

  public ClassInfo getParent();
  public ClassInfo addProperty(PropertyInfo p);

  public ClassInfo setObjClass(Class cls);
  public Class     getObjClass();

  public List      getAxioms();
  public Object    getAxiomByName(String name);
  public List      getAxiomsByClass(Class cls);
}
