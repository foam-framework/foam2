package foam.util;

import java.util.Comparator;
import java.util.Random;

public class QuickSortBenchmark {
  private static int count = 1;

  public static void main( String[] args) {
    // compare two algorithms for full sort
    runBenchmark(100000, 0, 100000);
    runBenchmark(200000, 0, 200000);
    runBenchmark(400000, 0, 400000);
    runBenchmark(800000, 0, 800000);

    // benchmark range
    runBenchmark( 1000000, 0, 20);
    runBenchmark( 2000000, 0, 20);
    runBenchmark( 4000000, 0, 20);
    runBenchmark( 8000000, 0, 20);
    runBenchmark(16000000, 0, 20);
    runBenchmark(32000000, 0, 20);

    runBenchmark(1000000, 10000, 20);
    runBenchmark(2000000, 10000, 20);
    runBenchmark(4000000, 10000, 20);
    runBenchmark(8000000, 10000, 20);
  }

  private static void benchmarkQuickSort(Integer[] array, int skip, int limit) {
    Arrays arr = new Arrays();
    long startTime = System.currentTimeMillis();
    arr.sortRange(array, Comparator.comparingInt(o -> (int) o), skip, limit);
    long endTime = System.currentTimeMillis();
    System.out.println("Time to sort with Dual Pivot QuickSort is " + (endTime - startTime) + "ms");
  }

  private static void benchmarkSort(Integer[] array) {
    long startTime = System.currentTimeMillis();
    java.util.Arrays.sort(array, Comparator.comparingInt(o -> (int) o));
    long endTime = System.currentTimeMillis();
    System.out.println("Time to sort with java.util.Arrays.sort is " + (endTime - startTime) + "ms");
  }

  private static void runBenchmark(int length, int skip, int limit) {
    Integer[] arrayRange = new Integer[length];
    for (int i = 0; i < length; i++) arrayRange[i] = new Random().nextInt();

    Integer[] arrayFull = arrayRange.clone();

    System.out.println();
    System.out.println(String.format("Benchmark #" + count + ".  Number of elements: %,d. Skipped: %,d. Limited: %,d", length, skip, limit));

    benchmarkSort(arrayFull);
    benchmarkQuickSort(arrayRange, skip, limit);
    count++;
  }
}
