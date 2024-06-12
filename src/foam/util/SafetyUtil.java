/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.util;

import java.util.regex.Pattern;
import foam.core.FObject;
import foam.core.Validatable;
import foam.core.X;

/** Convenience methods for performing standard operations with null checks. **/
public class SafetyUtil {

  // TODO: reuse Patterns and thread-local matchers
  public static void assertPattern(String val, String patternStr, String argumentName)
    throws IllegalArgumentException
  {
    Pattern pattern = Pattern.compile(patternStr);
    if ( ! pattern.matcher(val).matches() )
      throw new IllegalArgumentException(argumentName);
  }

  public static boolean equals(Object o1, Object o2) {
    return compare(o1, o2) == 0;
  }

  public static int compare(Object o1, Object o2) {
    if ( o1 == o2   ) return  0;
    if ( o2 == null ) return  1;
    if ( o1 == null ) return -1;

    // Number subtypes (Long, Integer, etc.) are type-specific comparable and
    // can only be compareTo the same type eg., Long can only compareTo Long.
    //
    // Converting o1 and o2 to double then comparing allows FOAM property types
    // that are java.lang.Number compatible such as Long, Int, Short, Byte,
    // Float and Double to be able to compareTo one another.
    //
    // Ex. The generated `isDefaultValue` of a Long property compares its value
    // to 0, which is an integer.
    //
    // This also allows predicates such as EQ, GT, LT and friends comparison
    // without explicit casting.
    //
    // Ex. EQ(User.ID, 1L) is the same as EQ(User.ID, 1).
    if ( o1 instanceof Number && o2 instanceof Number ) {
      double d1 = ((Number) o1).doubleValue();
      double d2 = ((Number) o2).doubleValue();

      if ( d1 == d2 ) return  0;
      if ( d1 > d2  ) return  1;
      return -1;
    }

    if ( o1.equals(o2) ||
      ! ( o1 instanceof Comparable || o2 instanceof Comparable ) ) return 0;
    if ( ! (o2 instanceof Comparable) ) return 1;
    if ( ! (o1 instanceof Comparable) ) return -1;

    return ((Comparable) o1).compareTo(o2);
  }

  public static int compare(Object[] o1, Object[] o2) {
    if ( o1 == o2   ) return  0;
    if ( o2 == null ) return  1;
    if ( o1 == null ) return -1;

    int d = compare(o1.length, o2.length);
    if ( d != 0 ) return d;

    for ( int i = 0 ; i < o1.length ; i++ ) {
      d = compare(o1[i], o2[i]);
      if ( d != 0 ) return d;
    }

    return 0;
  }

  public static int compare(FObject o1, FObject o2) {
    if ( o1 == o2   ) return  0;
    if ( o2 == null ) return  1;
    if ( o1 == null ) return -1;

    return o1.compareTo(o2);
  }

  public static int compare(boolean o1, boolean o2) {
    return o1 == o2 ? 0 : o1 ? 1 : -1;
  }

  public static int compare(String o1, String o2) {
    if ( o1 == null && o2 == null ) return 0;
    if ( o1 == null ) return -1;
    if ( o2 == null ) return  1;

    return o1.compareTo(o2);
  }

  public static int compare(short o1, short o2) {
    return o1 == o2 ? 0 : o1 < o2 ? -1 : 1;
  }

  public static int compare(int o1, int o2) {
    return o1 == o2 ? 0 : o1 < o2 ? -1 : 1;
  }

  public static int compare(long o1, long o2) {
    return o1 == o2 ? 0 : o1 < o2 ? -1 : 1;
  }

  public static int compare(float o1, float o2) {
    return o1 == o2 ? 0 : o1 < o2 ? -1 : 1;
  }

  public static int compare(double o1, double o2) {
    return o1 == o2 ? 0 : o1 < o2 ? -1 : 1;
  }

  public static int hashCode(Object o1) {
    return o1 == null ? 0 : o1.hashCode();
  }

  public static int hashCode(FObject o1) {
    return o1 == null ? 0 : o1.hashCode();
  }

  public static int hashCode(boolean o1) {
    return o1 ? 1 : 0;
  }

  public static int hashCode(String o1) {
    return o1 == null ? 0 : o1.hashCode();
  }

  public static int hashCode(short o1) {
    return o1;
  }

  public static int hashCode(int o1) {
    return o1;
  }

  public static int hashCode(long o1) {
    return (int)(o1^(o1>>>32));
  }

  public static int hashCode(float o1) {
    return  Float.floatToIntBits(o1);
  }

  public static int hashCode(double o1) {
    return hashCode(Double.doubleToRawLongBits(o1));
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
      java.util.Map result = (java.util.Map) o.getClass().newInstance();

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

  public static String trim(String s) {
    return s == null ? null : s.trim();
  }

  public static void validate(X x, Validatable v) {
    if ( v == null ) {
      throw new IllegalStateException("Object is null");
    }
    v.validate(x);
  }

}
