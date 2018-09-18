/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.util;

import foam.blob.HashingOutputStream;
import org.bouncycastle.jce.provider.BouncyCastleProvider;

import java.io.OutputStream;
import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.NoSuchAlgorithmException;
import java.security.PublicKey;
import java.security.SecureRandom;
import java.security.Security;
import java.security.interfaces.DSAPublicKey;
import java.security.interfaces.ECPublicKey;
import java.security.interfaces.RSAPublicKey;
import java.util.Base64;
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

  private static final char[] DIGITS = "0123456789abcdef".toCharArray();

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

  /**
   * Generates an SSH key fingerprint given a public key and using a default hashing algorithm of SHA-256.
   * @param key public key to generate fingerprint from
   * @return the ssh key fingerprint
   */
  public static String GenerateSSHKeyFingerprintFromPublicKey(PublicKey key) {
    return GenerateSSHKeyFingerprintFromPublicKey("SHA-256", key);
  }

  /**
   * Generates an SSH key fingerprint given a public key and hashing algorithm
   * @param algorithm hashing algorithm to use
   * @param key public key to generate fingerprint from
   * @return the ssh key fingerprint
   */
  public static String GenerateSSHKeyFingerprintFromPublicKey(String algorithm, PublicKey key) {
    if ( key instanceof DSAPublicKey ) {
      return GenerateSSHKeyFingerprintFromDSAPublicKey(algorithm, (DSAPublicKey) key);
    } else if ( key instanceof ECPublicKey ) {
      return GenerateSSHKeyFingerprintFromECPublicKey(algorithm, (ECPublicKey) key);
    } else if ( key instanceof RSAPublicKey ) {
      return GenerateSSHKeyFingerprintFromRSAPublicKey(algorithm, (RSAPublicKey) key);
    } else {
      throw new IllegalArgumentException("Unsupported public key encoding: " + key.getAlgorithm());
    }
  }

  /**
   * Generates an SSH key fingerprint given a DSA public key and hashing algorithm
   * @param algorithm hashing algorithm
   * @param key dsa public key
   * @return ssh key fingerprint
   */
  protected static String GenerateSSHKeyFingerprintFromDSAPublicKey(String algorithm, DSAPublicKey key) {
    try {
      byte[] tag = "ssh-dss".getBytes(StandardCharsets.US_ASCII);
      byte[] p = key.getParams().getP().toByteArray();
      byte[] q = key.getParams().getQ().toByteArray();
      byte[] g = key.getParams().getG().toByteArray();
      byte[] y = key.getY().toByteArray();

      HashingOutputStream hos = new HashingOutputStream(algorithm);

      // write tag
      Set4ByteInt(tag.length, hos);
      hos.write(tag, 0, tag.length);

      // write p
      Set4ByteInt(p.length, hos);
      hos.write(p, 0, p.length);

      // write q
      Set4ByteInt(q.length, hos);
      hos.write(q, 0, q.length);

      // write g
      Set4ByteInt(g.length, hos);
      hos.write(g, 0, g.length);

      // write y
      Set4ByteInt(y.length, hos);
      hos.write(y, 0, y.length);

      return GetSSHKeyFingerPrintString(algorithm, hos.digest());
    } catch ( Throwable t ) {
      throw new SecurityException("Unable to generate SSH key fingerprint: " + t.getMessage());
    }
  }

  /**
   * Generates an SSH key fingerprint given an ECDSA public key and hashing algorithm
   * @param algorithm hashing algorithm
   * @param key ecdsa public key
   * @return ssh key fingerprint
   */
  protected static String GenerateSSHKeyFingerprintFromECPublicKey(String algorithm, ECPublicKey key) {
    try {
      byte[] q = null;
      String curveName = null;
      int bitLength = key.getW().getAffineX().bitLength();

      if ( bitLength <= 256 ) {
        curveName = "nistp256";
        q = new byte[65];
      } else if ( bitLength <= 384 ) {
        curveName = "nistp384";
        q = new byte[97];
      } else if ( bitLength <= 521 ) {
        curveName = "nistp521";
        q = new byte[133];
      } else {
        throw new SecurityException("Unsupported ECDSA bit length: " + bitLength);
      }

      byte[] tag = ("ecdsa-sha2-" + curveName).getBytes(StandardCharsets.US_ASCII);
      byte[] curve = curveName.getBytes(StandardCharsets.US_ASCII);

      // copy q value from encoded key
      byte[] encoded = key.getEncoded();
      System.arraycopy(encoded, encoded.length - q.length, q, 0, q.length);

      HashingOutputStream hos = new HashingOutputStream(algorithm);

      // write tag
      Set4ByteInt(tag.length, hos);
      hos.write(tag, 0, tag.length);

      // write curve
      Set4ByteInt(curve.length, hos);
      hos.write(curve, 0, curve.length);

      // write q
      Set4ByteInt(q.length, hos);
      hos.write(q, 0, q.length);

      return GetSSHKeyFingerPrintString(algorithm, hos.digest());
    } catch ( Throwable t ) {
      throw new SecurityException("Unable to generate SSH key fingerprint: " + t.getMessage());
    }
  }

  /**
   * Generates an SSH key fingerprint given an RSA public key and hashing algorithm
   * @param algorithm hashing algorithm
   * @param key rsa public key
   * @return ssh key fingerprint
   */
  protected static String GenerateSSHKeyFingerprintFromRSAPublicKey(String algorithm, RSAPublicKey key) {
    try {
      byte[] tag = "ssh-rsa".getBytes(StandardCharsets.US_ASCII);
      byte[] e = key.getPublicExponent().toByteArray();
      byte[] n = key.getModulus().toByteArray();

      // write tag
      HashingOutputStream hos = new HashingOutputStream(algorithm);
      Set4ByteInt(tag.length, hos);
      hos.write(tag, 0, tag.length);

      // write public exponent
      Set4ByteInt(e.length, hos);
      hos.write(e, 0, e.length);

      // write modulus
      Set4ByteInt(n.length, hos);
      hos.write(n, 0, n.length);

      return GetSSHKeyFingerPrintString(algorithm, hos.digest());
    } catch ( Throwable t ) {
      throw new SecurityException("Unable to generate SSH key fingerprint: " + t.getMessage());
    }
  }

  /**
   * Generates the SSH key fingerprint string using algorithm and digest.
   * MD5 is encoded as a hex string delimited by colons
   * SHA1 and SHA256 is encoded as a base64 string
   * @param algorithm hashing algorithm
   * @param digest message digest
   * @return ssh key fingerprint string
   */
  protected static String GetSSHKeyFingerPrintString(String algorithm, byte[] digest) {
    if ( "MD5".equals(algorithm) ) {
      return "MD5:" + ByteArrayToHexString(digest, ':');
    } else if ( "SHA-1".equals(algorithm) ) {
      return "SHA1:" + Base64.getEncoder().withoutPadding().encodeToString(digest);
    } else if ( "SHA-256".equals(algorithm) ) {
      return "SHA256:" + Base64.getEncoder().withoutPadding().encodeToString(digest);
    } else {
      throw new IllegalArgumentException("Unsupported hashing algorithm");
    }
  }

  /**
   * Converts a byte array to a hex string
   * @param bytes bytes to convert
   * @return hex string
   */
  public static String ByteArrayToHexString(byte[] bytes) {
    return ByteArrayToHexString(bytes, '\u0000');
  }

  /**
   * Converts a byte array to hex string separating each value with a delimiter
   * @param bytes bytes to convert
   * @param delimiter delimiter to use
   * @return hex string delimited with provided delimter
   */
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
   * @param val integer value to write out
   * @param os output stream to write to
   * @throws java.io.IOException
   */
  public static void Set4ByteInt(int val, OutputStream os)
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
