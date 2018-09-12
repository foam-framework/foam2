/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.crypto.sign;

import java.security.*;

public interface Signable {

  /**
   * Signature generation method with user provided private key and default algorithm
   *
   * @param privateKey private key used for signature generation
   * @return the signature
   * @throws NoSuchAlgorithmException
   * @throws InvalidKeyException
   * @throws SignatureException
   */
  byte[] sign(PrivateKey privateKey)
    throws NoSuchAlgorithmException, InvalidKeyException, SignatureException;

  /**
   * Signature generation method with user provided algorithm and private key
   *
   * @param algorithm signing algorithm
   * @param key private key used for signature generation
   * @return the signature
   * @throws NoSuchAlgorithmException
   * @throws InvalidKeyException
   * @throws SignatureException
   */
  byte[] sign(String algorithm, PrivateKey key)
    throws NoSuchAlgorithmException, InvalidKeyException, SignatureException;

  /**
   * Signature generation with user provided Signature object
   *
   * @param signer signature object used for signature generation
   * @return the signature
   * @throws SignatureException
   */
  byte[] sign(Signature signer)
    throws SignatureException;

  /**
   * Signature verification method with user provided public key and default algorithm
   *
   * @param signature signature to verify
   * @param key public key used to verify signature
   * @return true if signature verified by public key, false otherwise
   * @throws NoSuchAlgorithmException
   * @throws InvalidKeyException
   * @throws SignatureException
   */
  boolean verify(byte[] signature, PublicKey key)
    throws NoSuchAlgorithmException, InvalidKeyException, SignatureException;

  /**
   * Signature verification method with user provided algorithm and public key
   *
   * @param signature signature to verify
   * @param algorithm signing algorithm
   * @param key public key used to verify signature
   * @return true if signature verified by public key, false otherwise
   * @throws NoSuchAlgorithmException
   * @throws InvalidKeyException
   * @throws SignatureException
   */
  boolean verify(byte[] signature, String algorithm, PublicKey key)
    throws NoSuchAlgorithmException, InvalidKeyException, SignatureException;

  /**
   * Signature verification method with user provided Signature object
   *
   * @param signature signature to verify
   * @param verifier signature object used to verify
   * @return true if signature verified by public key, false otherwise
   * @throws SignatureException
   */
  boolean verify(byte[] signature, Signature verifier)
    throws SignatureException;
}
