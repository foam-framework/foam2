// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
package foam.mlang.predicate;


public abstract class Unary extends foam.mlang.predicate.AbstractPredicate {
  private foam.mlang.Expr arg1_;
  private boolean arg1IsSet_ =     false;
;
  static foam.core.PropertyInfo ARG1 = new foam.core.AbstractFObjectPropertyInfo() {
      public String getName() {
        return "arg1";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public foam.mlang.Expr get_(Object o) {
        return ((Unary)o).getArg1();
      }
      public void set(Object o, Object value) {
        ((Unary)o).setArg1(cast(value));
      }
      public foam.mlang.Expr cast(Object o) {
        return (foam.mlang.Expr)o;
      }
      public int compare(Object o1, Object o2) {
        return compareValues(get_(o1),get_(o2));
      }
      public foam.lib.parse.Parser jsonParser() {
        return new foam.lib.json.ExprParser();
      }
      public boolean getTransient() {
        return false;
      }
      public boolean getRequired() {
        return false;
      }
    };
  private static final foam.core.ClassInfo classInfo_ = new foam.core.ClassInfoImpl()
    .setId("foam.mlang.predicate.Unary")
    .addProperty(Unary.ARG1);
  public foam.core.ClassInfo getClassInfo() {
    return classInfo_;
  }
  public static foam.core.ClassInfo getOwnClassInfo() {
    return classInfo_;
  }
  public foam.mlang.Expr getArg1() {
    if ( ! arg1IsSet_ ) {
     return null;
    }
    return arg1_;
  }
  public Unary setArg1(foam.mlang.Expr val) {
    arg1_ = val;
    arg1IsSet_ = true;
    return this;
  }
  public String toString() {
    return classInfo_.getId();
  }
}