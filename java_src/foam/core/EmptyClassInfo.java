package foam.core;

import java.util.Collections;
import java.util.List;

public class EmptyClassInfo implements ClassInfo{
  public ClassInfo setId(String id) {
    return this;
  }
  public ClassInfo getParent() {
    return this;
  }
  public ClassInfo addProperty(PropertyInfo p) {
    return this;
  }
  public List getAxioms() {
    return Collections.emptyList();
  }
  public Object getAxiomByName(String name) {
    return null;
  }
  public String getId() {
    return "EmptyClassInfo";
  }
  public List getAxiomsByClass(Class cls) {
    return Collections.emptyList();
  }
}
