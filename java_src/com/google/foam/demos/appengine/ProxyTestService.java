// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
package com.google.foam.demos.appengine;


public class ProxyTestService extends foam.core.AbstractFObject implements com.google.foam.demos.appengine.TestService {
  private com.google.foam.demos.appengine.TestService delegate_;
  private boolean delegateIsSet_ =     false;
;
  static foam.core.PropertyInfo DELEGATE = new foam.core.AbstractFObjectPropertyInfo() {
      public String getName() {
        return "delegate";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public com.google.foam.demos.appengine.TestService get_(Object o) {
        return ((ProxyTestService)o).getDelegate();
      }
      public void set(Object o, Object value) {
        ((ProxyTestService)o).setDelegate(cast(value));
      }
      public com.google.foam.demos.appengine.TestService cast(Object o) {
        return (com.google.foam.demos.appengine.TestService)o;
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
    .setId("com.google.foam.demos.appengine.ProxyTestService")
    .addProperty(ProxyTestService.DELEGATE);
  public foam.core.ClassInfo getClassInfo() {
    return classInfo_;
  }
  public static foam.core.ClassInfo getOwnClassInfo() {
    return classInfo_;
  }
  public com.google.foam.demos.appengine.TestService getDelegate() {
    if ( ! delegateIsSet_ ) {
     return null;
    }
    return delegate_;
  }
  public ProxyTestService setDelegate(com.google.foam.demos.appengine.TestService val) {
    delegate_ = val;
    delegateIsSet_ = true;
    return this;
  }
  public void doLog(String message) {
    getDelegate().doLog(message);
  }
  public void setValue(String value) {
    getDelegate().setValue(value);
  }
  public String getValue() {
    return getDelegate().getValue();
  }
}