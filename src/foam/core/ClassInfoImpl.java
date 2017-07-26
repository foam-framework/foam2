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

public class ClassInfoImpl
  implements ClassInfo
{
  private List      axioms;
  private String    id;
  private HashMap   axiomsByName_ = new HashMap();
  private ClassInfo parent_       = null;
  private List      allAxioms_    = null;
  private HashMap   axiomMap_     = new HashMap();
  private Class     class_;

  public ClassInfoImpl() {
    axioms = new ArrayList();
  }

  public String getId() {
    return id;
  }

  public ClassInfo setObjClass(Class cls) {
    class_ = cls;
    return this;
  }

  public Class getObjClass() {
    return class_;
  }

  public ClassInfo setId(String id) {
    this.id = id;
    return this;
  }

  public ClassInfo getParent() {
    if ( parent_ == null ) {
      Class c;
      java.lang.reflect.Method m;

      try {
        c = Class.forName(getId()).getSuperclass();
        m = c.getMethod("getOwnClassInfo");

        parent_ = (ClassInfo)m.invoke(null);
      } catch (NoSuchMethodException e) {
        parent_ = new EmptyClassInfo();
      } catch (Exception e) {
        throw new RuntimeException(e);
      }
    }

    return parent_;
  }

  public ClassInfo addProperty(PropertyInfo p) {
    p.setClassInfo(this);
    axioms.add(p);
    axiomsByName_.put(p.getName(), p);
    return this;
  }

  @Override
  public boolean isInstance(Object o) {
    return class_.isInstance(o);
  }

  @Override
  public Object newInstance() throws IllegalAccessException, InstantiationException {
    return class_.getClass().newInstance();
  }

  public List getAxioms() {
    if ( allAxioms_ == null ) {
      allAxioms_ = new ArrayList();
      allAxioms_.addAll(axioms);
      allAxioms_.addAll(getParent().getAxioms());
    }

    return allAxioms_;
  }

  public Object getAxiomByName(String name) {
    Object ret = axiomsByName_.get(name);

    if ( ret == null ) {
      ret = getParent().getAxiomByName(name);
    }

    return ret;
  }

  public List getAxiomsByClass(Class cls) {
    if ( axiomMap_.containsKey(cls) ) {
      return (List)axiomMap_.get(cls);
    }

    ArrayList ret = new ArrayList();
    for ( Iterator i = axioms.iterator() ; i.hasNext() ; ) {
      Object axiom = i.next();
      if ( cls.isInstance(axiom) ) ret.add(axiom);
    }

    ret.addAll(getParent().getAxiomsByClass(cls));
    axiomMap_.put(cls, ret);

    return ret;
  }
}
