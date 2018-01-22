/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.crypto.sign;

import java.security.NoSuchAlgorithmException;
import java.security.Provider;

public class ECDSASigner
  extends AbstractSigner
{
  public static final Signer SHA1_WITH_ECDSA;
  public static final Signer SHA224_WITH_ECDSA;
  public static final Signer SHA256_WITH_ECDSA;
  public static final Signer SHA384_WITH_ECDSA;
  public static final Signer SHA512_WITH_ECDSA;

  public static final Signer SHA3_224_WITH_ECDSA;
  public static final Signer SHA3_256_WITH_ECDSA;
  public static final Signer SHA3_384_WITH_ECDSA;
  public static final Signer SHA3_512_WITH_ECDSA;

  static {
    try {
      SHA1_WITH_ECDSA = new ECDSASigner("SHA1withECDSA");
      SHA224_WITH_ECDSA = new ECDSASigner("SHA224withECDSA");
      SHA256_WITH_ECDSA = new ECDSASigner("SHA256withECDSA");
      SHA384_WITH_ECDSA = new ECDSASigner("SHA384withECDSA");
      SHA512_WITH_ECDSA = new ECDSASigner("SHA512withECDSA");

      SHA3_224_WITH_ECDSA = new ECDSASigner("SHA3-224withECDSA");
      SHA3_256_WITH_ECDSA = new ECDSASigner("SHA3-256withECDSA");
      SHA3_384_WITH_ECDSA = new ECDSASigner("SHA3-384withECDSA");
      SHA3_512_WITH_ECDSA = new ECDSASigner("SHA3-512withECDSA");
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  public ECDSASigner(String algorithm) throws NoSuchAlgorithmException {
    super(algorithm);
  }

  public ECDSASigner(String algorithm, String provider) throws NoSuchAlgorithmException {
    super(algorithm, provider);
  }

  public ECDSASigner(String algorithm, Provider provider) throws NoSuchAlgorithmException {
    super(algorithm, provider);
  }
}