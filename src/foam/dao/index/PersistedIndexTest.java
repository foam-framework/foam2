package foam.dao.index;

import foam.nanos.auth.Country;
import org.apache.commons.text.RandomStringGenerator;

import java.io.IOException;

import static org.apache.commons.text.CharacterPredicates.DIGITS;
import static org.apache.commons.text.CharacterPredicates.LETTERS;

public class PersistedIndexTest {

  protected static final int SAMPLE_SIZE = 1000000;
  protected static String[] samples = new String[SAMPLE_SIZE];
  protected static RandomStringGenerator generator =
      new RandomStringGenerator.Builder()
          .withinRange('0', 'z')
          .filteredBy(LETTERS, DIGITS)
          .build();

  public static void main(String[] args) throws IOException {

    // generate random strings of length 50
    for ( int i = 0; i < SAMPLE_SIZE; i++ ) {
      samples[i] = generator.generate(50);
    }

    PersistedIndex index = new PersistedIndex("test", new TreeIndex(Country.CODE));
    long start = System.nanoTime();

    for ( int i = 0; i < SAMPLE_SIZE; i++ ) {
      index.wrap(samples[i]);
    }

    long end = System.nanoTime();
    long duration = (end - start);
    System.out.println("Duration is " + (((double) duration) / 1000000000.0) + " seconds");
  }
}