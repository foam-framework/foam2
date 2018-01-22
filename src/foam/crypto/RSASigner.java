/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.crypto;

import java.security.NoSuchAlgorithmException;
import java.security.Provider;

public class RSASigner
    extends AbstractSigner
{
  public static final Signer SHA1_WITH_RSA;
  public static final Signer SHA224_WITH_RSA;
  public static final Signer SHA256_WITH_RSA;
  public static final Signer SHA384_WITH_RSA;
  public static final Signer SHA512_WITH_RSA;

  public static final Signer SHA3_224_WITH_RSA;
  public static final Signer SHA3_256_WITH_RSA;
  public static final Signer SHA3_384_WITH_RSA;
  public static final Signer SHA3_512_WITH_RSA;

  static {
    try {
      SHA1_WITH_RSA = new RSASigner("SHA1withRSA");
      SHA224_WITH_RSA = new RSASigner("SHA224withRSA");
      SHA256_WITH_RSA = new RSASigner("SHA256withRSA");
      SHA384_WITH_RSA = new RSASigner("SHA384withRSA");
      SHA512_WITH_RSA = new RSASigner("SHA512withRSA");

      SHA3_224_WITH_RSA = new RSASigner("SHA3-224withRSA");
      SHA3_256_WITH_RSA = new RSASigner("SHA3-256withRSA");
      SHA3_384_WITH_RSA = new RSASigner("SHA3-384withRSA");
      SHA3_512_WITH_RSA = new RSASigner("SHA3-512withRSA");
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  private RSASigner(String algorithm) throws NoSuchAlgorithmException {
    super(algorithm);
  }

  public RSASigner(String algorithm, String provider) throws NoSuchAlgorithmException {
    super(algorithm, provider);
  }

  public RSASigner(String algorithm, Provider provider) throws NoSuchAlgorithmException {
    super(algorithm, provider);
  }
}