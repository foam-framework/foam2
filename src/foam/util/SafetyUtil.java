/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.util;

public class SafetyUtil {

  public static boolean equals(Object o1, Object o2) {
    return compare(o1, o2) == 0;
  }

  public static int compare(Object o1, Object o2) {
    if ( o1 == null && o2 == null ) return 0;
    if ( o2 == null ) return  1;
    if ( o1 == null ) return -1;

    if ( o1 instanceof Number && o2 instanceof Number ) {
      double d1 = ((Number) o1).doubleValue();
      double d2 = ((Number) o2).doubleValue();

      if ( d1 == d2 ) return  0;
      if ( d1  > d2 ) return  1;
      if ( d1  < d2 ) return -1;
    }

    return ((Comparable) o1).compareTo(o2);
  }

  public static Object deepClone(Object o) {
    if ( o == null ) return null;
    if ( o instanceof foam.core.FObject ) return ((foam.core.FObject)o).deepClone();
    if ( o.getClass().isArray() ) return foam.util.Arrays.deepClone(o);
    if ( o instanceof java.util.Map ) return deepCloneMap((java.util.Map)o);
    if ( o instanceof java.util.Collection ) return deepCloneCollection((java.util.Collection)o);

    // TODO: Non FObjects arn't cloneable, should we throw?
    // Certainly not for immutable boxed types Int, String, Double, etc,
    // but maybe we should for types we don't know about.
    return o;
  }

  public static java.util.Map deepCloneMap(java.util.Map o) {
    try {
      java.util.Map result = (java.util.Map)o.getClass().newInstance();

      java.util.Iterator<java.util.Map.Entry> entries = o.entrySet().iterator();

      while ( entries.hasNext() ) {
        java.util.Map.Entry entry = entries.next();
        Object value = deepClone(entry.getValue());
        result.put(entry.getKey(), value);
      }

      return result;
    } catch(InstantiationException | IllegalAccessException e) {
      return null;
    }
  }

  public static java.util.Collection deepCloneCollection(java.util.Collection o) {
    try {
      java.util.Collection result = (java.util.Collection)o.getClass().newInstance();

      java.util.Iterator iter = o.iterator();

      while ( iter.hasNext() ) {
        result.add(deepClone(iter.next()));
      }

      return result;
    } catch(InstantiationException | IllegalAccessException e) {
      return null;
    }
  }

  public static boolean isEmpty(String s) {
    return s == null || s.trim().isEmpty();
  }
}
