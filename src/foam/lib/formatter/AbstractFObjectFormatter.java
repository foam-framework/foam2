/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.formatter;

import foam.core.ClassInfo;
import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.core.X;
import foam.lib.PropertyPredicate;
import foam.lib.StorageOptionalPropertyPredicate;
import java.util.*;

public abstract class AbstractFObjectFormatter
  implements FObjectFormatter
{

  protected X                 x_;
  protected StringBuilder     b_                         = new StringBuilder();
  protected PropertyPredicate propertyPredicate_;
  protected PropertyPredicate optionalPredicate_ = new StorageOptionalPropertyPredicate();
  protected Map<String, List<PropertyInfo>> propertyMap_ = new HashMap<>();

  public AbstractFObjectFormatter(X x) {
    setX(x);
  }

  public AbstractFObjectFormatter() { }

  public void setX(X x) {
    x_ = x;
  }

  public X getX() {
    return x_;
  }

  public StringBuilder builder() { return b_; }

  public void reset() { builder().setLength(0); }

  public String stringify(FObject obj) {
    reset();
    output(obj);
    return b_.toString();
  }

  public String stringifyDelta(FObject oldFObject, FObject newFObject) {
    reset();
    outputDelta(oldFObject, newFObject);
    return b_.toString();
  }

/*
  public void output(String val);

  public void output(short val);

  public void output(int val);

  public void output(long val);

  public void output(float val);

  public void output(double val);

  public void output(boolean val);

  public void output(FObject[] arr, ClassInfo defaultClass);

  public void output(FObject[] arr);

  public void output(Object[] arr);

  public void output(byte[] arr);

  public void output(Map map);

  public void output(List list);

  public void output(Enum<?> val);

  public void output(Object val);

  public void output(FObject val);

  public void output(FObject val, ClassInfo defaultClass);

  public void output(Date val);

  public void output(ClassInfo val);

  public void output(PropertyInfo val);
  */

  protected synchronized List getProperties(ClassInfo info) {
    String of = info.getObjClass().getSimpleName().toLowerCase();

    if ( propertyMap_.containsKey(of) && propertyMap_.get(of).isEmpty() ) {
      propertyMap_.remove(of);
    }

    if ( ! propertyMap_.containsKey(of) ) {
      List<PropertyInfo> filteredAxioms = new ArrayList<>();
      Iterator e = info.getAxiomsByClass(PropertyInfo.class).iterator();
      while ( e.hasNext() ) {
        PropertyInfo prop = (PropertyInfo) e.next();
        if ( propertyPredicate_ == null || propertyPredicate_.propertyPredicateCheck(this.x_, of, prop) ) {
          filteredAxioms.add(prop);
        }
      }
      propertyMap_.put(of, filteredAxioms);
      return filteredAxioms;
    }
    return propertyMap_.get(of);
  }

  protected List getDelta(FObject oldFObject, FObject newFObject) {
    ClassInfo info           = oldFObject.getClassInfo();
    String    of             = info.getObjClass().getSimpleName().toLowerCase();
    List      axioms         = getProperties(info);
    int       size           = axioms.size();
    int       optional       = 0;

    List<PropertyInfo> delta = new ArrayList<>();

    for ( int i = 0 ; i < size ; i++ ) {
      PropertyInfo prop = (PropertyInfo) axioms.get(i);

      if ( prop.compare(oldFObject, newFObject) != 0 ) {
        delta.add(prop);
        if ( optionalPredicate_.propertyPredicateCheck(getX(), of, prop) ) {
          optional += 1;
        }
      }
    }
    if ( optional > 0 &&
         delta.size() == optional ) {
      delta = new ArrayList<>();
    }
    return delta;
  }

  public void setPropertyPredicate(PropertyPredicate p) {
    propertyPredicate_ = p;
  }

  public String toString() {
    return b_.toString();
  }

}
