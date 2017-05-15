// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
package foam.dao;


public class ProxySink extends foam.core.AbstractFObject implements foam.dao.Sink {
  private foam.dao.Sink delegate_;
  private boolean delegateIsSet_ =     false;
;
  static foam.core.PropertyInfo DELEGATE = new foam.core.AbstractFObjectPropertyInfo() {
      public String getName() {
        return "delegate";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public foam.dao.Sink get_(Object o) {
        return ((ProxySink)o).getDelegate();
      }
      public void set(Object o, Object value) {
        ((ProxySink)o).setDelegate(cast(value));
      }
      public foam.dao.Sink cast(Object o) {
        return (foam.dao.Sink)o;
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
    .setId("foam.dao.ProxySink")
    .addProperty(ProxySink.DELEGATE);
  public foam.core.ClassInfo getClassInfo() {
    return classInfo_;
  }
  public static foam.core.ClassInfo getOwnClassInfo() {
    return classInfo_;
  }
  public foam.dao.Sink getDelegate() {
    if ( ! delegateIsSet_ ) {
     return null;
    }
    return delegate_;
  }
  public ProxySink setDelegate(foam.dao.Sink val) {
    delegate_ = val;
    delegateIsSet_ = true;
    return this;
  }
  public void put(foam.core.FObject obj, foam.core.Detachable sub) {
    getDelegate().put(obj, sub);
  }
  public void remove(foam.core.FObject obj, foam.core.Detachable sub) {
    getDelegate().remove(obj, sub);
  }
  public void eof() {
    getDelegate().eof();
  }
  public void reset(foam.core.Detachable sub) {
    getDelegate().reset(sub);
  }
}