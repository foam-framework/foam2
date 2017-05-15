// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
package foam.mlang.predicate;


public abstract class AbstractPredicate extends foam.core.AbstractFObject implements foam.mlang.predicate.Predicate {
  private static final foam.core.ClassInfo classInfo_ = new foam.core.ClassInfoImpl()
    .setId("foam.mlang.predicate.AbstractPredicate");
  public foam.core.ClassInfo getClassInfo() {
    return classInfo_;
  }
  public static foam.core.ClassInfo getOwnClassInfo() {
    return classInfo_;
  }
  public foam.mlang.predicate.Predicate partialEval() {
    return this;
  }
  public String toString() {
    return classInfo_.getId();
  }
  public boolean f(foam.core.FObject obj) {
    return false;
  }
}