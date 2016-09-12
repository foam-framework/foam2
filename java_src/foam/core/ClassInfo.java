package foam.core;

import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;

public interface ClassInfo {
  public ClassInfo setId(String id);
  public ClassInfo getParent();
  public ClassInfo addProperty(PropertyInfo p);
  public List getAxioms();
  public Object getAxiomByName(String name);
  public String getId();
  public List getAxiomsByClass(Class cls);
}
