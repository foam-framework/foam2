// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
package foam.box;


public class CheckAuthenticationBox extends foam.box.ProxyBox {
  private static final foam.core.ClassInfo classInfo_ = new foam.core.ClassInfoImpl()
    .setId("foam.box.CheckAuthenticationBox");
  public foam.core.ClassInfo getClassInfo() {
    return classInfo_;
  }
  public static foam.core.ClassInfo getOwnClassInfo() {
    return classInfo_;
  }
  protected Object getTokenVerifier() {
    return getX().get("tokenVerifier");
  }
  public void send(foam.box.Message message) {
    
    try {
      String token = (String)message.getAttributes().get("idToken");
    
      if ( token == null ) {
        throw new java.security.GeneralSecurityException("No ID Token present.");
      }
    
      String principal = ((com.google.auth.TokenVerifier)getTokenVerifier()).verify(token);
    
      message.getAttributes().put("principal", principal);
    
      super.send(message);
    } catch ( java.security.GeneralSecurityException e) {
      throw new RuntimeException("Failed to verify token.", e);
    }
    
  }
}