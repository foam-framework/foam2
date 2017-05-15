// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
package foam.box;


public class ProxyBox extends foam.core.AbstractFObject implements foam.box.Box {
  private foam.box.Box delegate_;
  private boolean delegateIsSet_ =     false;
;
  static foam.core.PropertyInfo DELEGATE = new foam.core.AbstractFObjectPropertyInfo() {
      public String getName() {
        return "delegate";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public foam.box.Box get_(Object o) {
        return ((ProxyBox)o).getDelegate();
      }
      public void set(Object o, Object value) {
        ((ProxyBox)o).setDelegate(cast(value));
      }
      public foam.box.Box cast(Object o) {
        return (foam.box.Box)o;
      }
      public int compare(Object o1, Object o2) {
        return compareValues(get_(o1),get_(o2));
      }
      public foam.lib.parse.Parser jsonParser() {
        return new foam.lib.json.FObjectParser();
      }
      public boolean getTransient() {
        return false;
      }
      public boolean getRequired() {
        return false;
      }
    };
  private static final foam.core.ClassInfo classInfo_ = new foam.core.ClassInfoImpl()
    .setId("foam.box.ProxyBox")
    .addProperty(ProxyBox.DELEGATE);
  public foam.core.ClassInfo getClassInfo() {
    return classInfo_;
  }
  public static foam.core.ClassInfo getOwnClassInfo() {
    return classInfo_;
  }
  public foam.box.Box getDelegate() {
    if ( ! delegateIsSet_ ) {
     return null;
    }
    return delegate_;
  }
  public ProxyBox setDelegate(foam.box.Box val) {
    delegate_ = val;
    delegateIsSet_ = true;
    return this;
  }
  public void send(foam.box.Message message) {
    getDelegate().send(message);
  }
}