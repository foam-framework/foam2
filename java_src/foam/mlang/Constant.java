// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
package foam.mlang;


public class Constant extends foam.mlang.AbstractExpr implements foam.core.Serializable {
  private Object value_;
  private boolean valueIsSet_ =     false;
;
  static foam.core.PropertyInfo VALUE = new foam.core.AbstractObjectPropertyInfo() {
      public String getName() {
        return "value";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public Object get_(Object o) {
        return ((Constant)o).getValue();
      }
      public void set(Object o, Object value) {
        ((Constant)o).setValue(cast(value));
      }
      public Object cast(Object o) {
        return (Object)o;
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
    .setId("foam.mlang.Constant")
    .addProperty(Constant.VALUE);
  public foam.core.ClassInfo getClassInfo() {
    return classInfo_;
  }
  public static foam.core.ClassInfo getOwnClassInfo() {
    return classInfo_;
  }
  public Object getValue() {
    if ( ! valueIsSet_ ) {
     return null;
    }
    return value_;
  }
  public Constant setValue(Object val) {
    value_ = val;
    valueIsSet_ = true;
    return this;
  }
  public Object f(foam.core.FObject obj) {
    return getValue();
  }
}