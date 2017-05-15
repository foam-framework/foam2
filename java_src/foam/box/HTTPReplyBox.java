// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
package foam.box;


public class HTTPReplyBox extends foam.core.AbstractFObject implements foam.box.Box {
  private static final foam.core.ClassInfo classInfo_ = new foam.core.ClassInfoImpl()
    .setId("foam.box.HTTPReplyBox");
  public foam.core.ClassInfo getClassInfo() {
    return classInfo_;
  }
  public static foam.core.ClassInfo getOwnClassInfo() {
    return classInfo_;
  }
  public void send(foam.box.Message message) {
    try {
      java.io.PrintWriter writer = ((javax.servlet.ServletResponse)getX().get("httpResponse")).getWriter();
      writer.print(new foam.lib.json.Outputter().stringify(message));
      writer.flush();
    } catch(java.io.IOException e) {
      throw new RuntimeException(e);
    }
  }
}