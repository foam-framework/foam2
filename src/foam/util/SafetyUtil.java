package foam.util;


import java.math.BigDecimal;

public class SafetyUtil{

  public static int compare(Object o1 , Object o2)
  {
    if (o1 == null && o2 == null){    
      return 0;
    }
    if (o1 instanceof Number && o2 instanceof Number) {
      if (o1.toString() != "NaN" || o2.toString() != "NaN") {
        int i = new BigDecimal(o1.toString()).compareTo(new BigDecimal(o2.toString()));
        return i;
      }
    }
    if (o1 instanceof String && o2 instanceof String) {
      int i = ((String) o1).compareTo((String) o2);
      return i;
    }
    return ((Comparable) o1).compareTo(o2);
  }
}