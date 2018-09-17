package foam.util;

import foam.blob.HashingOutputStream;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.util.encoders.Base64;
import org.bouncycastle.util.encoders.Hex;

import java.io.OutputStream;
import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.NoSuchAlgorithmException;
import java.security.PublicKey;
import java.security.SecureRandom;
import java.security.Security;
import java.security.interfaces.DSAPublicKey;
import java.security.interfaces.RSAPublicKey;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
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

  private static final char[] DIGITS = "0123456789ABCDEF".toCharArray();

  private static ThreadLocal<StringBuilder> sb_ = new ThreadLocal<StringBuilder>() {
    @Override
    protected StringBuilder initialValue() {
      return new StringBuilder();
    }

    @Override
    public StringBuilder get() {
      StringBuilder b = super.get();
      b.setLength(0);
      return b;
    }
  };

  private static Map<String, SecureRandom> srand_ = new ConcurrentHashMap<>();

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
      SecureRandom srand = srand_.get(algorithm);

      // generate new secure random if srand is null or if we have reached our reseed interval
      if ( srand == null || count_.incrementAndGet().compareTo(interval_) == 0 ) {
        // get new instance and get next bytes to force seeding
        srand = SecureRandom.getInstance(algorithm);
        srand.nextBytes(new byte[16]);

        // store secure random in map
        srand_.put(algorithm, srand);
        return srand;
      }

      return srand;
    } catch ( Throwable t ) {
      throw new RuntimeException(t);
    }
  }

  public static String GenerateSSHKeyFingerprintFromPublicKey(PublicKey key) {
    return GenerateSSHKeyFingerprintFromPublicKey("SHA-256", key);
  }

  public static String GenerateSSHKeyFingerprintFromPublicKey(String algorithm, PublicKey key) {
    switch ( key.getAlgorithm() ) {
      case "DSA"  : return GenerateSSHKeyFingerprintFromDSAPublicKey(algorithm, (DSAPublicKey) key);
      case "RSA"  : return GenerateSSHKeyFingerprintFromRSAPublicKey(algorithm, (RSAPublicKey) key);
      default     : throw new IllegalArgumentException("Unsupported public key encoding: " + key.getAlgorithm());
    }
  }

  protected static String GenerateSSHKeyFingerprintFromDSAPublicKey(String algorithm, DSAPublicKey key) {
    try {
      byte[] tag = "ssh-dss".getBytes(StandardCharsets.UTF_8);
      byte[] p = key.getParams().getP().toByteArray();
      byte[] q = key.getParams().getQ().toByteArray();
      byte[] g = key.getParams().getG().toByteArray();
      byte[] y = key.getY().toByteArray();

      HashingOutputStream hos = new HashingOutputStream(algorithm);

      // write tag
      Set4ByteInt(hos, tag.length);
      hos.write(tag, 0, tag.length);

      // write p
      Set4ByteInt(hos, p.length);
      hos.write(p, 0, p.length);

      // write q
      Set4ByteInt(hos, q.length);
      hos.write(q, 0, q.length);

      // write g
      Set4ByteInt(hos, g.length);
      hos.write(g, 0, g.length);

      // write y
      Set4ByteInt(hos, y.length);
      hos.write(y, 0, y.length);

      return GetSSHKeyFingerPrintString(algorithm, hos.digest());
    } catch ( Throwable t ) {
      throw new SecurityException("Unable to generate SSH key fingerprint: " + t.getMessage());
    }
  }

  protected static String GenerateSSHKeyFingerprintFromRSAPublicKey(String algorithm, RSAPublicKey key) {
    try {
      byte[] tag = "ssh-rsa".getBytes(StandardCharsets.UTF_8);
      byte[] e = key.getPublicExponent().toByteArray();
      byte[] n = key.getModulus().toByteArray();

      // write tag
      HashingOutputStream hos = new HashingOutputStream(algorithm);
      Set4ByteInt(hos, tag.length);
      hos.write(tag, 0, tag.length);

      // write public exponent
      Set4ByteInt(hos, e.length);
      hos.write(e, 0, e.length);

      // write modulus
      Set4ByteInt(hos, n.length);
      hos.write(n, 0, n.length);

      return GetSSHKeyFingerPrintString(algorithm, hos.digest());
    } catch ( Throwable t ) {
      throw new SecurityException("Unable to generate SSH key fingerprint: " + t.getMessage());
    }
  }

  protected static String GetSSHKeyFingerPrintString(String algorithm, byte[] digest) {
    switch ( algorithm ) {
      case "MD5"      : return "MD5:"    + ByteArrayToHexString(digest, ':');
      case "SHA-1"    : return "SHA1:"   + Base64.toBase64String(digest);
      case "SHA-256"  : return "SHA256:" + Base64.toBase64String(digest);
      default         : throw new IllegalArgumentException("Unsupported hashing algorithm");
    }
  }

  public static String ByteArrayToHexString(byte[] bytes) {
    return ByteArrayToHexString(bytes, '\u0000');
  }

  public static String ByteArrayToHexString(byte[] bytes, char delimiter) {
    StringBuilder builder = sb_.get();
    for ( int i = 0 ; i < bytes.length ; i++ ) {
      builder.append(SecurityUtil.DIGITS[(bytes[i] >> 4) & 0x0F]);
      builder.append(SecurityUtil.DIGITS[bytes[i] & 0x0F]);
      if ( delimiter != '\u0000' && i != bytes.length - 1 ) {
        builder.append(delimiter);
      }
    }

    return builder.toString();
  }

  /**
   * Writes an integer to the output stream out to 4 bytes big endian encoding
   * @param os output stream to write to
   * @param val integer value to write out
   * @throws java.io.IOException
   */
  public static void Set4ByteInt(OutputStream os, int val)
    throws java.io.IOException
  {
    os.write((byte)((val & 0xFF000000) >> 24));
    os.write((byte)((val & 0x00FF0000) >> 16));
    os.write((byte)((val & 0x0000FF00) >> 8));
    os.write((byte)((val & 0x000000FF)));
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
