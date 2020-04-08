/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.util;

import java.lang.reflect.Array;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public class Arrays {

  /**
    Append an existing array to one or more Items of the same Type
    Example:
      String[] s1 = new String[]{"a", "b", "c"};
      String[] s2 = new String[]{"d", "e", "f"};
      String [] merged = ArrayUtils.append(s1, s2); // Output : [{"a", "b", "c", "d", "e", "f"}]
      String [] merged2 = ArrayUtils.append(s1, "Ball"); // Output : [{"a", "b", "c", "Ball"}]
      String [] merged3 = ArrayUtils.append(s1, "Ball", "Soccer"); // Output : [{"a", "b", "c", "Ball", "Soccer"}]
  *
  * @param <T> the component type of the array
  * @param array  the initial array
  * @param items  new items to be added to original array
  * @return The new array
  **/
  public static <T> T[] append(T[] array, T... items) {

    if ( array == null ) return items;
    if ( items == null ) return array;

    T[] mergedArray = (T[]) Array.newInstance( array.getClass().getComponentType(), array.length + items.length );
    System.arraycopy( array, 0, mergedArray, 0, array.length );
    System.arraycopy( items, 0, mergedArray, array.length, items.length );

    return mergedArray;
  }

  public static Object deepClone(Object value) {
    if ( value == null ) return null;

    if ( ! value.getClass().isArray() )
      throw new RuntimeException("Tried to clone non array " + value.getClass().getName() + " with foam.util.Arrays.deepClone().");

    int    length = java.lang.reflect.Array.getLength(value);
    Object result = java.lang.reflect.Array.newInstance(value.getClass().getComponentType(), length);

    // TODO: This may be slow when dealing with primitive value arrays
    // as it will box/unbox every element.  But maybe the JIT is smart
    // enough to handle it.  Otherwise we should have custom implementations
    // in every "<primitive>PropertyInfo"
    for ( int i = 0 ; i < length ; i++ ) {
      java.lang.reflect.Array.set(result, i,
        foam.util.SafetyUtil.deepClone(java.lang.reflect.Array.get(value, i)));
    }

    return result;
  }

  /**
    Convert an array of keys and values into a Map.
    Example:
    HashMap map = foam.util.Arrays.asHashMap({
      "key1", "value1",
      "key2", "value2"
      ...
    });
  **/
  public static Map asMap(Object[] arr) {
    HashMap m = new HashMap();
    if ( arr != null ) {
      for ( int i = 0 ; i < arr.length ; i += 2 ) {
        m.put(arr[i], arr[i+1]);
      }
    }
    return m;
  }

  /**
    Convert an array of values into a Set.
    Example:
    HashMap map = foam.util.Arrays.asHashMap({
      "key1", "value1",
      "key2", "value2"
      ...
    });
  **/
  public static Set asSet(Object[] arr) {
    HashSet s = new HashSet();
    if ( arr != null ) {
      for ( int i = 0 ; i < arr.length ; i++ ) {
        s.add(arr[i]);
      }
    }
    return s;
  }

  /**
   * Implement a dual-pivot quicksort which only sorts over the specified range.
   * Often data needs to be sorted, but the end user will only view a range
   * of the data because of pagination or scrolling. This algorithm takes
   * into account the provided 'skip' (number of initial rows not seen) and
   * 'limit' (numberof rows seen) to optimize the sort by only partially sorting
   * the data. All data in the specified skip/limit range is fully sorted and
   * all data before the range is less than or equal to the first value in the
   * range and all data after the range is greater to or euqal to the last
   * value in the range. Data outside of the specified range is partitioned
   * but not sorted. The algorithm uses a quicksort (a dual-pivot variant),
   * which works by first partitioning the data and then recursing on each
   * partition. This algorithm works by stopping the recursion for partitions
   * which it knows are out of range.
   *
   * sortRange(array, comparator, 0, array.length) is the same as a full sort
   * sortRange(array, comparator, 0, 1) will put the smallest value at array[0]
   * sortRange(array, comparator, array.length-1, 1) will put the largest value at array[length-1]
   **/
  public static void sortRange(Object[] a, Comparator c, int skip, int limit) {
    sortRange(a, c, skip, limit, 0, a.length-1);
  }

  protected static void swap(Object[] a, int i1, int i2) {
    Object tmp = a[i1];
    a[i1] = a[i2];
    a[i2] = tmp;
  }

  protected static void sortRange(Object[] a, Comparator c, int skip, int limit, int start, int end) {
    if ( end <= start ) return;
    if ( start >= skip + limit ) return;
    if ( end < skip ) return;

    if ( end - start < 27 || ( skip <= start && skip + limit - 1 >= end ) ) {
      java.util.Arrays.sort(a, start, end, c);
      return;
    }

    int p1 = start, p2 = end;

    if ( c.compare(a[p1], a[p2]) > 0 ) swap(a, p1, p2);

    for ( var i = start + 1 ; i < p2 ; i++ ) {
      int d = c.compare(a[p1], a[i]);
      if ( d == 1 ) {
        swap(a, p1, p1 + 1);
        if ( p1 + 1 != i )
          swap(a, p1, i);
        p1++;
      } else {
        d = c.compare(a[i], a[p2]);
        if ( d == 1 ) {
          swap(a, p2, p2 - 1);
          if ( p2 - 1 != i ) {
            swap(a, p2, i);
            i--;
          }
          p2--;
        } else if ( d == 0 ) {
          swap(a, p2 - 1, i);
          i--;
          p2--;
        }
      }
    }

    sortRange(a, c, skip, limit, start, p1 - 1);
    sortRange(a, c, skip, limit, p1 + 1, p2 - 1);
    sortRange(a, c, skip, limit, p2 + 1, end);
  }

}
