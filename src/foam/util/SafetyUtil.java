/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.util;

public class SafetyUtil {
  public static int compare(Object o1 , Object o2) {
    if ( o1 == null && o2 == null ) return 0;
    if ( o2 == null ) return 1;
    if ( o1 == null ) return -1;

    if ( o1 instanceof Number && o2 instanceof Number ) {
      double d1 = ( (Number) o1 ).doubleValue();
      double d2 = ( (Number) o2 ).doubleValue();

      if ( d1 == d2 ) return  0;
      if ( d1  > d2 ) return  1;
      if ( d1  < d2 ) return -1;
    }

    return ((Comparable) o1).compareTo(o2);
  }

  public static boolean isEmpty(String s) {
    return s == null || s.isEmpty();
  }
}
