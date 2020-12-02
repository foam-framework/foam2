package foam.util;

import java.util.Comparator;
import java.util.Random;

public class QuickSortTest {

  public static void main(String[] args) {
    testArraySorting(5387, 0, 5387);
    testArraySorting(9174, 375, 9174);
    testArraySorting(1666, 234, 185);
    testArraySorting(2349, 0, 236);
    testArraySorting(88888, 2111, 0);
    testArraySorting(723, 0, 0);
  }

  public static void testArraySorting(int arrLength, int skip, int limit) {
    Integer[] array = new Integer[arrLength];
    for (int i = 0; i < arrLength; i++) array[i] = new Random().nextInt();

    Arrays arr = new Arrays();
    arr.sortRange(array, Comparator.comparingInt(o -> (int) o), skip, limit);

    assert ensureSmallerValues(array, skip) : "All skipped values are less or equal then the first element in the range";
    assert ensureBiggerValues(array, skip + limit) : "All elements after the limit are bigger or equal to the last element in the range";
    assert ensureIsSorted(array, skip, limit) : "All elements within the range are sorted";
  }

  private static boolean ensureSmallerValues(Integer[] a, int skip) {
    if (skip == 0 || skip > a.length) return true;

    for (int i = 0; i < skip; i++) {
      if (a[i] > a[skip]) return false;
    }
    return true;
  }

  private static boolean ensureBiggerValues(Integer[] a, int lastElement) {
    if (lastElement == 0) return true;

    for (int i = lastElement; i < a.length; i++) {
      if (a[lastElement - 1] > a[i]) return false;
    }
    return true;
  }

  private static boolean ensureIsSorted(Integer[] a, int skip, int limit) {
    int lastElement = skip + limit > a.length ? a.length - 1 : skip + limit - 1;

    for (int i = skip; i < lastElement; i++) {
      if (a[i] > a[i + 1]) return false;
    }
    return true;
  }
}