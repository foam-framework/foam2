/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.crypto.sign;

import java.io.IOException;
import java.io.OutputStream;
import java.security.PrivateKey;
import java.security.SecureRandom;
import java.security.Signature;
import java.security.SignatureException;

/**
 * Output stream that signs outgoing data
 */
public class SigningOutputStream
    extends OutputStream
{
  protected Signature sig_;
  protected OutputStream out_;

  /**
   * Creates and initializes a Signature given the algorithm and key
   * @param algorithm signing algorithm to use
   * @param key private key used for signing
   * @return signature initialized with algorithm and private key
   */
  private static Signature getSignature(String algorithm, PrivateKey key) {
    try {
      Signature signature = Signature.getInstance(algorithm);
      signature.initSign(key, SecureRandom.getInstance("SHA1PRNG"));
      return signature;
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  public SigningOutputStream(PrivateKey key, OutputStream out) {
    this("SHA256with"+key.getAlgorithm(), key, out);
  }

  public SigningOutputStream(String algorithm, PrivateKey key, OutputStream out) {
    this(getSignature(algorithm, key), out);
  }

  public SigningOutputStream(Signature signature, OutputStream out) {
    sig_ = signature;
    out_ = out;
  }

  @Override
  public void write(int b) throws IOException {
    try {
      sig_.update((byte) b);
      out_.write(b);
    } catch (Throwable t) {
      throw new IOException(t);
    }
  }

  @Override
  public void write(byte[] b, int off, int len) throws IOException {
    try {
      sig_.update(b, off, len);
      out_.write(b, off, len);
    } catch (Throwable t) {
      throw new IOException(t);
    }
  }

  @Override
  public void close() throws IOException {
    out_.close();
  }

  public byte[] sign() throws SignatureException {
    return sig_.sign();
  }
}