// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
package foam.mlang.predicate;


public class Contains extends foam.mlang.predicate.Binary implements foam.core.Serializable {
  private static final foam.core.ClassInfo classInfo_ = new foam.core.ClassInfoImpl()
    .setId("foam.mlang.predicate.Contains");
  public foam.core.ClassInfo getClassInfo() {
    return classInfo_;
  }
  public static foam.core.ClassInfo getOwnClassInfo() {
    return classInfo_;
  }
  public boolean f(foam.core.FObject obj) {
    String s1 = (String)getArg1().f(obj);
    String s2 = (String)getArg2().f(obj);
    return s1 != null ? s1.indexOf(s2) != -1 : false;
    
  }
}