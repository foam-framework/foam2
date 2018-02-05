/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.crypto.sign;

import java.io.IOException;
import java.io.InputStream;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.Signature;

/**
 * Input stream that verifies incoming data
 */
public class SigningInputStream
    extends InputStream
{
  protected Signature sig_;
  protected InputStream in_;

  /**
   * Creates and initializes a Signature given the algorithm and key
   * @param algorithm signing algorithm to use
   * @param key public key used for verifying
   * @return signature initialized with algorithm and public key
   */
  private static Signature getSignature(String algorithm, PublicKey key) {
    try {
      Signature signature = Signature.getInstance(algorithm);
      signature.initVerify(key);
      return signature;
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  public SigningInputStream(PublicKey key, InputStream in) {
    this("SHA256with"+key.getAlgorithm(), key, in);
  }

  public SigningInputStream(String algorithm, PublicKey key, InputStream in) {
    this(getSignature(algorithm, key), in);
  }

  public SigningInputStream(Signature signature, InputStream in) {
    sig_ = signature;
    in_ = in;
  }

  @Override
  public int read() throws IOException {
    try {
      int b = in_.read();
      sig_.update((byte) b);
      return b;
    } catch (Throwable t) {
      throw new IOException(t);
    }
  }

  @Override
  public int read(byte[] b, int off, int len) throws IOException {
    try {
      int read = in_.read(b, off, len);
      sig_.update(b, off, len);
      return read;
    } catch (Throwable t) {
      throw new IOException(t);
    }
  }

  @Override
  public void close() throws IOException {
    in_.close();
  }
}