/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import java.util.*;

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
      } catch (java.lang.Exception e) {
        throw new RuntimeException(e);
      }
    }

    return parent_;
  }

  public ClassInfo addAxiom(Axiom a) {
    // TODO: Should all axioms have setClassInfo? If not, create an interface
    // that has setClassInfo and make PropertyInfo implement it.
    if (a instanceof PropertyInfo) {
      ((PropertyInfo)a).setClassInfo(this);
    }
    axioms.add(a);
    axiomsByName_.put(a.getName(), a);
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
      allAxioms_ = new ArrayList() {
        HashSet<String> keys = new HashSet<>();

        @Override
        public boolean add(Object o) {
          if ( ! (o instanceof Axiom) ) {
            return super.add(o);
          }
          if ( keys.add(((Axiom) o).getName()) ) {
            return super.add(o);
          }
          return false;
        }

        @Override
        public boolean addAll(Collection c) {
          for ( Object o : c ) {
            this.add(o);
          }
          return true;
        }
      };

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

  public List getAxiomsByClass(final Class cls) {
    if ( axiomMap_.containsKey(cls) ) {
      return (List) axiomMap_.get(cls);
    }

    ArrayList ret = new ArrayList() {
      HashSet<String> keys = new HashSet<>();

      @Override
      public boolean add(Object o) {
        if ( ! cls.isInstance(o) ) {
          return false;
        }
        if ( ! (o instanceof Axiom) ) {
          return super.add(o);
        }
        if ( keys.add(((Axiom) o).getName()) ) {
          return super.add(o);
        }
        return false;
      }

      @Override
      public boolean addAll(Collection c) {
        for ( Object o : c ) {
          this.add(o);
        }
        return true;
      }
    };

    ret.addAll(axioms);
    ret.addAll(getParent().getAxiomsByClass(cls));
    axiomMap_.put(cls, ret);
    return ret;
  }
}
