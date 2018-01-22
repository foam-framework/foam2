/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.crypto.sign;

import java.security.*;

/**
 * Signer interface
 */
public interface Signer {
  /**
   * Signs plaintext data given a Private key
   *
   * @param plaintext the data to sign
   * @param privateKey the private key to sign plaintext with
   * @return the signed plaintext data
   *
   * @throws NoSuchAlgorithmException
   * @throws InvalidKeyException
   * @throws SignatureException
   */
  byte[] sign(byte[] plaintext, PrivateKey privateKey)
      throws NoSuchAlgorithmException, InvalidKeyException, SignatureException;

  /**
   * Verifies plaintext data given a signature and a Public key
   *
   * @param plaintext the data to verify
   * @param signature the signature to verify with
   * @param publicKey the public key to use for signature verification
   * @return true if verified, false otherwise
   *
   * @throws NoSuchAlgorithmException
   * @throws InvalidKeyException
   * @throws SignatureException
   */
  boolean verify(byte[] plaintext, byte[] signature, PublicKey publicKey)
      throws NoSuchAlgorithmException, InvalidKeyException, SignatureException;
}