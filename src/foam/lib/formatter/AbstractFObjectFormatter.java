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
import java.util.*;

public abstract class AbstractFObjectFormatter
  implements FObjectFormatter
{

  protected X                 x_;
  protected StringBuilder     b_                         = new StringBuilder();
  protected PropertyPredicate propertyPredicate_;
  protected Map<String, List<PropertyInfo>> propertyMap_ = new HashMap<>();

  public AbstractFObjectFormatter(X x) {
    x_ = x;
  }

  public AbstractFObjectFormatter() { }

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
    String of = info.getObjClass().getSimpleName();

    if ( propertyMap_.containsKey(of) && propertyMap_.get(of).isEmpty() ) {
      propertyMap_.remove(of);
    }

    if ( ! propertyMap_.containsKey(of) ) {
      List<PropertyInfo> filteredAxioms = new ArrayList<>();
      Iterator e = info.getAxiomsByClass(PropertyInfo.class).iterator();
      while ( e.hasNext() ) {
        PropertyInfo prop = (PropertyInfo) e.next();
        if ( propertyPredicate_ == null || propertyPredicate_.propertyPredicateCheck(this.x_, of.toLowerCase(), prop) ) {
          filteredAxioms.add(prop);
        }
      }
      propertyMap_.put(of, filteredAxioms);
      return filteredAxioms;
    }
    return propertyMap_.get(of);
  }

  public void setPropertyPredicate(PropertyPredicate p) {
    propertyPredicate_ = p;
  }

  public String toString() {
    return b_.toString();
  }

}
