// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
package foam.mlang.predicate;


public abstract class Binary extends foam.mlang.predicate.AbstractPredicate {
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
        return ((Binary)o).getArg1();
      }
      public void set(Object o, Object value) {
        ((Binary)o).setArg1(cast(value));
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
  private foam.mlang.Expr arg2_;
  private boolean arg2IsSet_ =     false;
;
  static foam.core.PropertyInfo ARG2 = new foam.core.AbstractFObjectPropertyInfo() {
      public String getName() {
        return "arg2";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public foam.mlang.Expr get_(Object o) {
        return ((Binary)o).getArg2();
      }
      public void set(Object o, Object value) {
        ((Binary)o).setArg2(cast(value));
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
    .setId("foam.mlang.predicate.Binary")
    .addProperty(Binary.ARG1)
    .addProperty(Binary.ARG2);
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
  public Binary setArg1(foam.mlang.Expr val) {
    arg1_ = val;
    arg1IsSet_ = true;
    return this;
  }
  public foam.mlang.Expr getArg2() {
    if ( ! arg2IsSet_ ) {
     return null;
    }
    return arg2_;
  }
  public Binary setArg2(foam.mlang.Expr val) {
    arg2_ = val;
    arg2IsSet_ = true;
    return this;
  }
  public String toString() {
    return classInfo_.getId();
  }
}