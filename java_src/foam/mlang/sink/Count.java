// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
package foam.mlang.sink;


public class Count extends foam.dao.AbstractSink implements foam.core.Serializable {
  private int value_;
  private boolean valueIsSet_ =     false;
;
  static foam.core.PropertyInfo VALUE = new foam.core.AbstractIntPropertyInfo() {
      public String getName() {
        return "value";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public int get_(Object o) {
        return ((Count)o).getValue();
      }
      public void set(Object o, Object value) {
        ((Count)o).setValue(cast(value));
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
    .setId("foam.mlang.sink.Count")
    .addProperty(Count.VALUE);
  public foam.core.ClassInfo getClassInfo() {
    return classInfo_;
  }
  public static foam.core.ClassInfo getOwnClassInfo() {
    return classInfo_;
  }
  public int getValue() {
    if ( ! valueIsSet_ ) {
     return 0;
    }
    return value_;
  }
  public Count setValue(int val) {
    value_ = val;
    valueIsSet_ = true;
    return this;
  }
  public void put(foam.core.FObject obj, foam.core.Detachable sub) {
    return;
  }
  public void remove(foam.core.FObject obj, foam.core.Detachable sub) {
    return;
  }
  public void reset(foam.core.Detachable sub) {
    return;
  }
}