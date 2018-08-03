/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.util;

import org.bouncycastle.crypto.PBEParametersGenerator;
import org.bouncycastle.crypto.generators.PKCS5S2ParametersGenerator;
import org.bouncycastle.crypto.params.KeyParameter;
import org.bouncycastle.util.encoders.Base64;

import java.security.SecureRandom;
import java.util.regex.Pattern;

public class Password {

  // Min 8 characters, at least one uppercase, one lowercase, one number
  private static Pattern PASSWORD_PATTERN = Pattern.compile("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$");

  /**
   * Generates random salt given a size
   * @param size size of the salt
   * @return random salt
   */
  private static byte[] salt(int size) {
    byte[] salt = new byte[size];
    SecurityUtil.GetSecureRandom().nextBytes(salt);
    return salt;
  }

  /**
   * Encodes byte array to base64 string
   * @param input data to encode
   * @return base64 encoded string
   */
  private static String encode(byte[] input) {
    return new String(Base64.encode(input));
  }

  /**
   * Decodes a base64 string into a byte array
   * @param input base64 string
   * @return byte array
   */
  private static byte[] decode(String input) {
    return Base64.decode(input);
  }

  private static String getSalt(String input) {
    return input.substring(0, input.indexOf(":"));
  }

  /**
   * Hashes a plaintext password
   * @param password password to hash
   * @return hashed password containing the salt. Format salt:hash
   */
  public static String hash(String password) {
    return hash(password, salt(8));
  }

  private static String hash(String password, byte[] salt) {
    return hash(password, salt, 512, 1000);
  }

  /**
   * Helper function to hash the password that takes in the salt, key size, and number of iterations
   * @param password password to has
   * @param salt random salt
   * @param keySize key size
   * @param iterations number of iterations
   * @return hashed password containing the salt. Format salt:hash
   */
  private static String hash(String password, byte[] salt, int keySize, int iterations) {
    if ( SafetyUtil.isEmpty(password) ) throw new IllegalArgumentException("Password cannot be empty");
    PKCS5S2ParametersGenerator generator = new PKCS5S2ParametersGenerator();
    generator.init(PBEParametersGenerator.PKCS5PasswordToBytes(password.toCharArray()), salt, iterations);
    byte[] key = ((KeyParameter) generator.generateDerivedParameters(keySize)).getKey();
    return String.format("%s:%s", encode(salt), encode(key));
  }

  /**
   * Function used to verify a password matches a hash
   * @param password password
   * @param hash hash to verify against
   * @return true if matches, false otherwise
   */
  public static boolean verify(String password, String hash) {
    try {
      return hash(password, decode(getSalt(hash))).equals(hash);
    } catch ( Throwable t ) {
      return false;
    }
  }

  /**
   * Determines whether or not password is valid or not
   * @param password password to validate
   * @return true if valid, false otherwise
   */
  public static boolean isValid(String password) {
    return ! SafetyUtil.isEmpty(password) && PASSWORD_PATTERN.matcher(password).matches();
  }
}
