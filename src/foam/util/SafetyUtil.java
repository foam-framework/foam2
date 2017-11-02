package foam.util;


import java.math.BigDecimal;

public class SafetyUtil{

  public static int compare(Object o1 , Object o2) {
    
    if ( o1 == null && o2 == null) return 0;
    if ( o2 == null ) return 1;
    if ( o1 == null ) return -1;

    if (o1 instanceof Number && o2 instanceof Number) {      
      if( ((Number) o1).doubleValue() == ((Number) o2).doubleValue()) return 0;
      if( ((Number) o1).doubleValue() >  ((Number) o2).doubleValue()) return 1;
      if( ((Number) o1).doubleValue() <  ((Number) o2).doubleValue()) return -1;
    }
    return ((Comparable) o1).compareTo(o2);
  }
}
