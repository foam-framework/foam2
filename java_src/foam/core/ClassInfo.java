package foam.core;

import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;

public class ClassInfo {
  private List<Object> axioms;
  private String id;

  public ClassInfo() {
    axioms = new ArrayList<Object>();
  }

  public ClassInfo setId(String id) {
    this.id = id;
    return this;
  }

  private HashMap axiomsByName_ = new HashMap();

  public ClassInfo addProperty(PropertyInfo p) {
    p.setClassInfo(this);
    axioms.add(p);
    axiomsByName_.put(p.getName(), p);
    return this;
  }

  public List<Object> getAxioms() {
    return axioms;
  }

  public Object getAxiomByName(String name) {
    return axiomsByName_.get(name);
  }

  public String getId() {
    return id;
  }

  private HashMap axiomMap_ = new HashMap();

  public List getAxiomsByClass(Class cls) {
    if ( axiomMap_.containsKey(cls) ) {
      return (List)axiomMap_.get(cls);
    }

    ArrayList ret = new ArrayList();
    Iterator i = axioms.iterator();
    while ( i.hasNext() ) {
      Object axiom = i.next();
      if ( cls.isInstance(axiom) ) {
        ret.add(axiom);
      }
    }

    axiomMap_.put(cls, ret);
    return ret;
  }
}
