// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
package foam.box;


public class SubBox extends foam.box.ProxyBox {
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
        return ((SubBox)o).getName();
      }
      public void set(Object o, Object value) {
        ((SubBox)o).setName(cast(value));
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
  private static final foam.core.ClassInfo classInfo_ = new foam.core.ClassInfoImpl()
    .setId("foam.box.SubBox")
    .addProperty(SubBox.NAME);
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
  public SubBox setName(String val) {
    name_ = val;
    nameIsSet_ = true;
    return this;
  }
  public void send(foam.box.Message message) {
    
    getDelegate().send(message.setObject(
        getX().create(foam.box.SubBoxMessage.class)
            .setName(getName())
            .setObject(message.getObject())));
    
  }
}