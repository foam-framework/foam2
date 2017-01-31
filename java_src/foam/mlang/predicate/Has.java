// DO NOT MODIFY BY HAND.
// GENERATED CODE (adamvy@google.com)
package foam.mlang.predicate;


public class Has extends foam.mlang.predicate.Unary {
  private static final foam.core.ClassInfo classInfo_ = new foam.core.ClassInfoImpl()
    .setId("foam.mlang.predicate.Has");
  public foam.core.ClassInfo getClassInfo() {
    return classInfo_;
  }
  public static foam.core.ClassInfo getOwnClassInfo() {
    return classInfo_;
  }
  public boolean f(foam.core.FObject obj) {
      return obj != null;
      //return ((Comparable)getArg1().f(obj)).compareTo((Comparable)getArg2().f(obj)) < 0;
  }
}
