// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
package foam.box;


public class BoxRegistryBox extends foam.box.BoxRegistry implements foam.box.Box {
  private static final foam.core.ClassInfo classInfo_ = new foam.core.ClassInfoImpl()
    .setId("foam.box.BoxRegistryBox");
  public foam.core.ClassInfo getClassInfo() {
    return classInfo_;
  }
  public static foam.core.ClassInfo getOwnClassInfo() {
    return classInfo_;
  }
  public void send(foam.box.Message message) {
    
    if ( message.getObject() instanceof foam.box.SubBoxMessage ) {
      foam.box.SubBoxMessage subBoxMessage = (foam.box.SubBoxMessage)message.getObject();
      message.setObject(subBoxMessage.getObject());
      ((Registration)getRegistry().get(subBoxMessage.getName())).getLocalBox().send(message);
    } else {
      throw new RuntimeException("Invalid message type " + message.getClass().getName());
    }
    
  }
}