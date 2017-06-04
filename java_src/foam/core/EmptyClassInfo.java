package foam.core;

import java.util.Collections;
import java.util.List;

// TODO: document what this is for
public class EmptyClassInfo
  implements ClassInfo
{
  public String getId() {
    return "EmptyClassInfo";
  }

  public ClassInfo setId(String id) {
    return this;
  }

  public ClassInfo getParent() {
    return this;
  }

  public ClassInfo addProperty(PropertyInfo p) {
    return this;
  }

  public ClassInfo setObjClass(Class cls) {
    return null;
  }

  public Class getObjClass() {
    return null;
  }

  public List getAxioms() {
    return Collections.emptyList();
  }

  public Object getAxiomByName(String name) {
    return null;
  }

  public List getAxiomsByClass(Class cls) {
    return Collections.emptyList();
  }
}
