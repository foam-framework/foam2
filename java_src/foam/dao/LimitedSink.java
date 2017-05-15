// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
package foam.dao;


public class LimitedSink extends foam.dao.ProxySink {
  private int limit_;
  private boolean limitIsSet_ =     false;
;
  static foam.core.PropertyInfo LIMIT = new foam.core.AbstractIntPropertyInfo() {
      public String getName() {
        return "limit";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public int get_(Object o) {
        return ((LimitedSink)o).getLimit();
      }
      public void set(Object o, Object value) {
        ((LimitedSink)o).setLimit(cast(value));
      }
      public int cast(Object o) {
        return ( o instanceof Number ) ?((Number)o).intValue() :(int)o;
      }
      public int compare(Object o1, Object o2) {
        return compareValues(get_(o1),get_(o2));
      }
      public foam.lib.parse.Parser jsonParser() {
        return new foam.lib.json.IntParser();
      }
      public boolean getTransient() {
        return false;
      }
      public boolean getRequired() {
        return false;
      }
    };
  private int count_;
  private boolean countIsSet_ =     false;
;
  static foam.core.PropertyInfo COUNT = new foam.core.AbstractIntPropertyInfo() {
      public String getName() {
        return "count";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public int get_(Object o) {
        return ((LimitedSink)o).getCount();
      }
      public void set(Object o, Object value) {
        ((LimitedSink)o).setCount(cast(value));
      }
      public int cast(Object o) {
        return ( o instanceof Number ) ?((Number)o).intValue() :(int)o;
      }
      public int compare(Object o1, Object o2) {
        return compareValues(get_(o1),get_(o2));
      }
      public foam.lib.parse.Parser jsonParser() {
        return new foam.lib.json.IntParser();
      }
      public boolean getTransient() {
        return false;
      }
      public boolean getRequired() {
        return false;
      }
    };
  private static final foam.core.ClassInfo classInfo_ = new foam.core.ClassInfoImpl()
    .setId("foam.dao.LimitedSink")
    .addProperty(LimitedSink.LIMIT)
    .addProperty(LimitedSink.COUNT);
  public foam.core.ClassInfo getClassInfo() {
    return classInfo_;
  }
  public static foam.core.ClassInfo getOwnClassInfo() {
    return classInfo_;
  }
  public int getLimit() {
    if ( ! limitIsSet_ ) {
     return 0;
    }
    return limit_;
  }
  public LimitedSink setLimit(int val) {
    limit_ = val;
    limitIsSet_ = true;
    return this;
  }
  public int getCount() {
    if ( ! countIsSet_ ) {
     return 0;
    }
    return count_;
  }
  public LimitedSink setCount(int val) {
    count_ = val;
    countIsSet_ = true;
    return this;
  }
  public void put(foam.core.FObject obj, foam.core.Detachable sub) {
    if ( getCount() >= getLimit() ) {
      if ( sub != null ) sub.detach();
    } else {
      setCount(getCount() + 1);
      getDelegate().put(obj, sub);
    }
    
  }
  public void remove(foam.core.FObject obj, foam.core.Detachable sub) {
    if ( getCount() >= getLimit() ) {
      if ( sub != null ) sub.detach();
    } else {  setCount(getCount() + 1);
      getDelegate().put(obj, sub);
    }
    
  }
}