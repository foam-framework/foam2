// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
package foam.box;


public class RPCReturnMessage extends foam.core.AbstractFObject {
  private Object data_;
  private boolean dataIsSet_ =     false;
;
  static foam.core.PropertyInfo DATA = new foam.core.AbstractObjectPropertyInfo() {
      public String getName() {
        return "data";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public Object get_(Object o) {
        return ((RPCReturnMessage)o).getData();
      }
      public void set(Object o, Object value) {
        ((RPCReturnMessage)o).setData(cast(value));
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
    .setId("foam.box.RPCReturnMessage")
    .addProperty(RPCReturnMessage.DATA);
  public foam.core.ClassInfo getClassInfo() {
    return classInfo_;
  }
  public static foam.core.ClassInfo getOwnClassInfo() {
    return classInfo_;
  }
  public Object getData() {
    if ( ! dataIsSet_ ) {
     return null;
    }
    return data_;
  }
  public RPCReturnMessage setData(Object val) {
    data_ = val;
    dataIsSet_ = true;
    return this;
  }
}