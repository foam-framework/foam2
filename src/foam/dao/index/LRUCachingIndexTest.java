/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao.index;

import foam.nanos.auth.Country;
import org.apache.commons.text.RandomStringGenerator;

import java.io.IOException;

import static org.apache.commons.text.CharacterPredicates.DIGITS;
import static org.apache.commons.text.CharacterPredicates.LETTERS;

public class LRUCachingIndexTest {

  protected static final int SAMPLE_SIZE = 1000000;
  protected static Object[] wrapped = new Object[SAMPLE_SIZE];
  protected static String[] samples = new String[SAMPLE_SIZE];
  protected static RandomStringGenerator generator =
      new RandomStringGenerator.Builder()
          .withinRange('0', 'z')
          .filteredBy(LETTERS, DIGITS)
          .build();

  public static void main(String[] args) throws IOException {
    long startTotal;
    long endTotal;

    long start;
    long end;
    long duration;

    // generate random strings of length 50
    for ( int i = 0; i < SAMPLE_SIZE; i++ ) {
      samples[i] = generator.generate(50);
    }

    LRUCachingIndex index = new LRUCachingIndex(1000000,
        new PersistedIndex("test", new TreeIndex(Country.CODE)));
    startTotal = start = System.nanoTime();

    for ( int i = 0; i < SAMPLE_SIZE; i++ ) {
      wrapped[i] = index.wrap(samples[i]);
    }

    end = System.nanoTime();
    duration = ( end - start );
    System.out.println("Wrapping took: " + (((double) duration) / 1000000000.0) + " seconds");

    start = System.nanoTime();

    for ( int i = 0; i < SAMPLE_SIZE; i++ ) {
      index.unwrap(wrapped[i]);
    }

    endTotal = end = System.nanoTime();
    duration = ( end - start );
    System.out.println("Unwrapping took: " + (((double) duration) / 1000000000.0) + " seconds");
    duration = ( endTotal - startTotal );
    System.out.println("Total duration: " + (((double) duration) / 1000000000.0) + " seconds");
  }
}