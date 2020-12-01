/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.formatter;

import foam.core.ClassInfo;
import foam.core.FEnum;
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
  protected PropertyPredicate optionalPredicate_         = new StorageOptionalPropertyPredicate();
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

  // single point of access to b_ to simplify subclassing.
  public StringBuilder append(Object o) {
    b_.append(o);
    return b_;
  }

  public void reset() {
    builder().setLength(0);
  }

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

  protected synchronized List getProperties(ClassInfo info) {
    String of = info.getObjClass().getName();

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

  public void setPropertyPredicate(PropertyPredicate p) {
    propertyPredicate_ = p;
  }

  public String toString() {
    return b_.toString();
  }

}
