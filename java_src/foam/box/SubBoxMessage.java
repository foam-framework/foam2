// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
package foam.box;


public class SubBoxMessage extends foam.core.AbstractFObject {
  private String name_;
  private boolean nameIsSet_ =     false;
;
  static foam.core.PropertyInfo NAME = new foam.core.AbstractStringPropertyInfo() {
      public String getName() {
        return "name";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public String get_(Object o) {
        return ((SubBoxMessage)o).getName();
      }
      public void set(Object o, Object value) {
        ((SubBoxMessage)o).setName(cast(value));
      }
      public String cast(Object o) {
        return (String)o;
      }
      public int compare(Object o1, Object o2) {
        return compareValues(get_(o1),get_(o2));
      }
      public foam.lib.parse.Parser jsonParser() {
        return new foam.lib.json.StringParser();
      }
      public boolean getTransient() {
        return false;
      }
      public boolean getRequired() {
        return false;
      }
      public int getWidth() {
        return 30;
      }
    };
  private Object object_;
  private boolean objectIsSet_ =     false;
;
  static foam.core.PropertyInfo OBJECT = new foam.core.AbstractObjectPropertyInfo() {
      public String getName() {
        return "object";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public Object get_(Object o) {
        return ((SubBoxMessage)o).getObject();
      }
      public void set(Object o, Object value) {
        ((SubBoxMessage)o).setObject(cast(value));
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
    .setId("foam.box.SubBoxMessage")
    .addProperty(SubBoxMessage.NAME)
    .addProperty(SubBoxMessage.OBJECT);
  public foam.core.ClassInfo getClassInfo() {
    return classInfo_;
  }
  public static foam.core.ClassInfo getOwnClassInfo() {
    return classInfo_;
  }
  public String getName() {
    if ( ! nameIsSet_ ) {
     return "";
    }
    return name_;
  }
  public SubBoxMessage setName(String val) {
    name_ = val;
    nameIsSet_ = true;
    return this;
  }
  public Object getObject() {
    if ( ! objectIsSet_ ) {
     return null;
    }
    return object_;
  }
  public SubBoxMessage setObject(Object val) {
    object_ = val;
    objectIsSet_ = true;
    return this;
  }
}