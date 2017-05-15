// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
package foam.dao;


public class OrderedSink extends foam.dao.ProxySink {
  private foam.mlang.order.Comparator comparator_;
  private boolean comparatorIsSet_ =     false;
;
  static foam.core.PropertyInfo COMPARATOR = new foam.core.AbstractFObjectPropertyInfo() {
      public String getName() {
        return "comparator";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public foam.mlang.order.Comparator get_(Object o) {
        return ((OrderedSink)o).getComparator();
      }
      public void set(Object o, Object value) {
        ((OrderedSink)o).setComparator(cast(value));
      }
      public foam.mlang.order.Comparator cast(Object o) {
        return (foam.mlang.order.Comparator)o;
      }
      public int compare(Object o1, Object o2) {
        return compareValues(get_(o1),get_(o2));
      }
      public foam.lib.parse.Parser jsonParser() {
        return new foam.lib.json.FObjectParser(foam.mlang.order.Comparator.class);
      }
      public boolean getTransient() {
        return false;
      }
      public boolean getRequired() {
        return false;
      }
    };
  private java.util.List array_;
  private boolean arrayIsSet_ =     false;
;
  static foam.core.PropertyInfo ARRAY = new foam.core.AbstractObjectPropertyInfo() {
      public String getName() {
        return "array";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public java.util.List get_(Object o) {
        return ((OrderedSink)o).getArray();
      }
      public void set(Object o, Object value) {
        ((OrderedSink)o).setArray(cast(value));
      }
      public java.util.List cast(Object o) {
        return (java.util.List)o;
      }
      public int compare(Object o1, Object o2) {
        return compareValues(get_(o1),get_(o2));
      }
      public foam.lib.parse.Parser jsonParser() {
        return new foam.lib.json.AnyParser();
      }
      public boolean getTransient() {
        return false;
      }
      public boolean getRequired() {
        return false;
      }
    };
  private static final foam.core.ClassInfo classInfo_ = new foam.core.ClassInfoImpl()
    .setId("foam.dao.OrderedSink")
    .addProperty(OrderedSink.COMPARATOR)
    .addProperty(OrderedSink.ARRAY);
  public foam.core.ClassInfo getClassInfo() {
    return classInfo_;
  }
  public static foam.core.ClassInfo getOwnClassInfo() {
    return classInfo_;
  }
  public foam.mlang.order.Comparator getComparator() {
    if ( ! comparatorIsSet_ ) {
     return null;
    }
    return comparator_;
  }
  public OrderedSink setComparator(foam.mlang.order.Comparator val) {
    comparator_ = val;
    comparatorIsSet_ = true;
    return this;
  }
  public java.util.List getArray() {
    if ( ! arrayIsSet_ ) {
     return null;
    }
    return array_;
  }
  public OrderedSink setArray(java.util.List val) {
    array_ = val;
    arrayIsSet_ = true;
    return this;
  }
  public void put(foam.core.FObject obj, foam.core.Detachable sub) {
    if ( getArray() == null ) setArray(new java.util.ArrayList());
    getArray().add(obj);
  }
  public void eof() {
    if ( getArray() == null ) setArray(new java.util.ArrayList());
    java.util.Collections.sort(getArray());
    foam.dao.Subscription sub = getX().create(foam.dao.Subscription.class);
    for ( Object o : getArray() ) {
      if ( sub.getDetached() ) {
        break;
      }
      getDelegate().put((foam.core.FObject)o, sub);
    }
  }
  public void remove(foam.core.FObject obj, foam.core.Detachable sub) {
    getDelegate().remove(obj, sub);
  }
}