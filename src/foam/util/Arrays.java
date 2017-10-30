package foam.util;

import java.lang.reflect.Array;

public class Arrays {

  /* Append an existing array to one or more Items of the same Type
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
  */
  public static <T> T[] append(T[] array, T... items) {

    if( array == null ) {
      return items;
    }
    if ( items == null) {
      return array;
    }

    T[] mergedArray = (T[]) Array.newInstance( array.getClass().getComponentType(), array.length + items.length );
    System.arraycopy( array, 0, mergedArray, 0, array.length );
    System.arraycopy( items, 0, mergedArray, array.length, items.length );

    return mergedArray;
  }

}