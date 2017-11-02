package foam.util;


import java.math.BigDecimal;

public class SafetyUtil{

  public static int compare(Object o1 , Object o2) {
    
    if ( o1 == null && o2 == null) return 0;
    if ( o2 == null ) return 1;
    if ( o1 == null ) return -1;

    if (o1 instanceof Number && o2 instanceof Number) {
      if (o1.toString() != "NaN" || o2.toString() != "NaN") {
        return new BigDecimal(o1.toString()).compareTo(new BigDecimal(o2.toString()));
      }
    }
    return ((Comparable) o1).compareTo(o2);
  }
}
