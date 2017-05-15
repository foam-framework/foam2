// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
package foam.box;


public class Message extends foam.core.AbstractFObject {
  private java.util.Map attributes_;
  private boolean attributesIsSet_ =     false;
;
  static foam.core.PropertyInfo ATTRIBUTES = new foam.core.AbstractObjectPropertyInfo() {
      public String getName() {
        return "attributes";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public java.util.Map get_(Object o) {
        return ((Message)o).getAttributes();
      }
      public void set(Object o, Object value) {
        ((Message)o).setAttributes(cast(value));
      }
      public java.util.Map cast(Object o) {
        return (java.util.Map)o;
      }
      public int compare(Object o1, Object o2) {
        return compareValues(get_(o1),get_(o2));
      }
      public foam.lib.parse.Parser jsonParser() {
        return new foam.lib.json.MapParser();
      }
      public boolean getTransient() {
        return false;
      }
      public boolean getRequired() {
        return false;
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
        return ((Message)o).getObject();
      }
      public void set(Object o, Object value) {
        ((Message)o).setObject(cast(value));
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
    .setId("foam.box.Message")
    .addProperty(Message.ATTRIBUTES)
    .addProperty(Message.OBJECT);
  public foam.core.ClassInfo getClassInfo() {
    return classInfo_;
  }
  public static foam.core.ClassInfo getOwnClassInfo() {
    return classInfo_;
  }
  public java.util.Map getAttributes() {
    if ( ! attributesIsSet_ ) {
     return null;
    }
    return attributes_;
  }
  public Message setAttributes(java.util.Map val) {
    attributes_ = val;
    attributesIsSet_ = true;
    return this;
  }
  public Object getObject() {
    if ( ! objectIsSet_ ) {
     return null;
    }
    return object_;
  }
  public Message setObject(Object val) {
    object_ = val;
    objectIsSet_ = true;
    return this;
  }
}