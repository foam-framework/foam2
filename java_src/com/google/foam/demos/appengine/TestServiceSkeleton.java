// DO NOT MODIFY BY HAND.
// GENERATED CODE (adamvy@google.com)
package com.google.foam.demos.appengine;


public class TestServiceSkeleton extends foam.core.ContextAwareSupport implements foam.box.Box {
  private com.google.foam.demos.appengine.TestService delegate_;
  private boolean delegateIsSet_ =     false;
;
  static foam.core.PropertyInfo DELEGATE = new foam.core.AbstractObjectPropertyInfo() {
      public String getName() {
        return "delegate";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public com.google.foam.demos.appengine.TestService get_(Object o) {
        return ((TestServiceSkeleton)o).getDelegate();
      }
      public void set(Object o, Object value) {
        ((TestServiceSkeleton)o).setDelegate(cast(value));
      }
      public com.google.foam.demos.appengine.TestService cast(Object o) {
        return (com.google.foam.demos.appengine.TestService)o;
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
    };
  public com.google.foam.demos.appengine.TestService getDelegate() {
    if ( ! delegateIsSet_ ) {
     return null;
    }
    return delegate_;
  }
  public TestServiceSkeleton setDelegate(com.google.foam.demos.appengine.TestService val) {
    delegate_ = val;
    delegateIsSet_ = true;
    return this;
  }
  public void send(foam.box.Message message) {
    if ( ! ( message.getObject() instanceof foam.box.RPCMessage) ) {
          // TODO error to errorBox
          return;
        }
    
        foam.box.RPCMessage rpc = (foam.box.RPCMessage)message.getObject();
        foam.box.Box replyBox = (foam.box.Box)message.getAttributes().get("replyBox");
        Object result = null;
    
        switch ( rpc.getName() ) {
          case "doLog":
            getDelegate().doLog(
              (String)(rpc.getArgs() != null && rpc.getArgs().length > 0 ? rpc.getArgs()[0] : null));
            break;
        
          case "setValue":
            getDelegate().setValue(
              (String)(rpc.getArgs() != null && rpc.getArgs().length > 0 ? rpc.getArgs()[0] : null));
            break;
        
          case "getValue":
            result = getDelegate().getValue(
              );
            break;
        
          default: throw new RuntimeException("No such method found \"" + rpc.getName() + "\"");
        }
    
        if ( replyBox != null ) {
          foam.box.RPCReturnMessage reply = (foam.box.RPCReturnMessage)getX().create(foam.box.RPCReturnMessage.class);
          reply.setData(result);
    
          replyBox.send(getX().create(foam.box.Message.class).setObject(reply));
        }
  }
}