// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
package foam.dao;


public class SkipSink extends foam.dao.ProxySink {
  private int skip_;
  private boolean skipIsSet_ =     false;
;
  static foam.core.PropertyInfo SKIP = new foam.core.AbstractIntPropertyInfo() {
      public String getName() {
        return "skip";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public int get_(Object o) {
        return ((SkipSink)o).getSkip();
      }
      public void set(Object o, Object value) {
        ((SkipSink)o).setSkip(cast(value));
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
        return ((SkipSink)o).getCount();
      }
      public void set(Object o, Object value) {
        ((SkipSink)o).setCount(cast(value));
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
    .setId("foam.dao.SkipSink")
    .addProperty(SkipSink.SKIP)
    .addProperty(SkipSink.COUNT);
  public foam.core.ClassInfo getClassInfo() {
    return classInfo_;
  }
  public static foam.core.ClassInfo getOwnClassInfo() {
    return classInfo_;
  }
  public int getSkip() {
    if ( ! skipIsSet_ ) {
     return 0;
    }
    return skip_;
  }
  public SkipSink setSkip(int val) {
    skip_ = val;
    skipIsSet_ = true;
    return this;
  }
  public int getCount() {
    if ( ! countIsSet_ ) {
     return 0;
    }
    return count_;
  }
  public SkipSink setCount(int val) {
    count_ = val;
    countIsSet_ = true;
    return this;
  }
  public void put(foam.core.FObject obj, foam.core.Detachable sub) {
    if ( getCount() < getSkip() ) {
      setCount(getCount() + 1);
      return;}
    getDelegate().put(obj, sub);
  }
  public void remove(foam.core.FObject obj, foam.core.Detachable sub) {
    if ( getCount() < getSkip() ) {
      setCount(getCount() + 1);
      return;}
    getDelegate().remove(obj, sub);
  }
  public void reset(foam.core.Detachable sub) {
    getDelegate().reset(sub);
  }
}