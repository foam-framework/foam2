// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
package foam.mlang.predicate;


public abstract class Nary extends foam.mlang.predicate.AbstractPredicate {
  private foam.mlang.predicate.Predicate[] args_;
  private boolean argsIsSet_ =     false;
;
  static foam.core.PropertyInfo ARGS = new foam.core.AbstractPropertyInfo() {
      public String getName() {
        return "args";
      }
      public Object get(Object o) {
        return get_(o);
      }
      public foam.mlang.predicate.Predicate[] get_(Object o) {
        return ((Nary)o).getArgs();
      }
      public void set(Object o, Object value) {
        ((Nary)o).setArgs(cast(value));
      }
      public foam.mlang.predicate.Predicate[] cast(Object o) {
        Object[] value = (Object[])o;
        foam.mlang.predicate.Predicate[] ret = new foam.mlang.predicate.Predicate[value.length];
        System.arraycopy(value, 0, ret, 0, value.length);
        return ret;
      }
      public int compare(Object o1, Object o2) {
        
        foam.mlang.predicate.Predicate[] values1 = get_(o1);
        foam.mlang.predicate.Predicate[] values2 = get_(o2);
        if ( values1.length > values2.length ) return 1;
        if ( values1.length < values2.length ) return -1;
        
        int result;
        for ( int i = 0 ; i < values1.length ; i++ ) {
        result = ((Comparable)values1[i]).compareTo(values2[i]);
        if ( result != 0 ) return result;
        }
        return 0;
        
      }
      public foam.lib.parse.Parser jsonParser() {
        return new foam.lib.json.FObjectArrayParser();
      }
      public boolean getTransient() {
        return false;
      }
      public boolean getRequired() {
        return false;
      }
    };
  private static final foam.core.ClassInfo classInfo_ = new foam.core.ClassInfoImpl()
    .setId("foam.mlang.predicate.Nary")
    .addProperty(Nary.ARGS);
  public foam.core.ClassInfo getClassInfo() {
    return classInfo_;
  }
  public static foam.core.ClassInfo getOwnClassInfo() {
    return classInfo_;
  }
  public foam.mlang.predicate.Predicate[] getArgs() {
    if ( ! argsIsSet_ ) {
     return null;
    }
    return args_;
  }
  public Nary setArgs(foam.mlang.predicate.Predicate[] val) {
    args_ = val;
    argsIsSet_ = true;
    return this;
  }
  public String toString() {
    return classInfo_.getId();
  }
}