package foam.util;

import org.bouncycastle.jce.provider.BouncyCastleProvider;

import java.math.BigInteger;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.Security;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.BinaryOperator;

public class SecurityUtil {
  static {
    // add bouncy castle provider
    BouncyCastleProvider provider = new BouncyCastleProvider();
    if ( Security.getProvider(provider.getName()) == null ) {
      Security.addProvider(provider);
    }
  }

  private static SecureRandom srand_ = null;

  // reseed counter, atomic so we don't exceed reseed count
  private static AtomicBigInteger count_ = new AtomicBigInteger();

  // reseed interval as defined by NIST SP 800-90A
  private static BigInteger interval_ = new BigInteger("1000000000000", 16);

  /**
   * Generates a SecureRandom using SHA1PRNG as the default algorithm
   *
   * @return secure random instance
   */
  public static SecureRandom GetSecureRandom() {
    return GetSecureRandom("SHA1PRNG");
  }

  /**
   * Generates a SecureRandom using a user provided algorithm
   *
   * @param algorithm secure random algorithm
   * @return secure random instance
   * @throws NoSuchAlgorithmException
   */
  public static SecureRandom GetSecureRandom(String algorithm) {
    try {
      // generate new secure random if srand is null or if we have reached our reseed interval
      if ( srand_ == null || count_.incrementAndGet().compareTo(interval_) == 0 ) {
        // get new instance and get next bytes to force seeding
        srand_ = SecureRandom.getInstance(algorithm);
        srand_.nextBytes(new byte[16]);
        return srand_;
      }

      return srand_;
    } catch ( Throwable t ) {
      throw new RuntimeException(t);
    }
  }

  /**
   * Class that has the ability to increment a BigInteger atomically
   */
  static final class AtomicBigInteger {

    private final AtomicReference<BigInteger> bigInteger;

    public AtomicBigInteger() {
      this(BigInteger.ZERO);
    }

    public AtomicBigInteger(final BigInteger bigInteger) {
      this.bigInteger = new AtomicReference<>(Objects.requireNonNull(bigInteger));
    }

    public BigInteger get() {
      return bigInteger.get();
    }

    /**
     * Increments the BigInteger reference by one and returns it
     * @return BigInteger reference
     */
    public BigInteger incrementAndGet() {
      return bigInteger.accumulateAndGet(BigInteger.ONE, new BinaryOperator<BigInteger>() {
        @Override
        public BigInteger apply(BigInteger o1, BigInteger o2) {
          return o1.add(o2);
        }
      });
    }

    /**
     * Returns the BigInteger reference and then increments by one
     * @return BigInteger reference
     */
    public BigInteger getAndIncrement() {
      return bigInteger.getAndAccumulate(BigInteger.ONE, new BinaryOperator<BigInteger>() {
        @Override
        public BigInteger apply(BigInteger o1, BigInteger o2) {
          return o1.add(o2);
        }
      });
    }
  }
}
