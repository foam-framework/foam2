// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
package foam.mlang.predicate;


public class StartsWithIC extends foam.mlang.predicate.Binary implements foam.core.Serializable {
  private static final foam.core.ClassInfo classInfo_ = new foam.core.ClassInfoImpl()
    .setId("foam.mlang.predicate.StartsWithIC");
  public foam.core.ClassInfo getClassInfo() {
    return classInfo_;
  }
  public static foam.core.ClassInfo getOwnClassInfo() {
    return classInfo_;
  }
  public boolean f(foam.core.FObject obj) {
    String arg2 = ((String)getArg2().f(obj)).toUpperCase();
    Object arg1 = getArg1().f(obj);
    if ( arg1 instanceof Object[] ) {
      Object[] values = (Object[])arg1;
      for ( int i = 0 ; i < values.length ; i++ ) {
        if ( ((String)values[i]).toUpperCase().startsWith(arg2) ) {
          return true;
        }
      }
      return false;}String value = (String)arg1;
    return value.toUpperCase().startsWith(arg2);
    
  }
}