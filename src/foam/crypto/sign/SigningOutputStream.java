/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.crypto.sign;

import foam.util.SecurityUtil;

import java.io.IOException;
import java.io.OutputStream;
import java.security.*;

/**
 * Output stream that signs outgoing data
 */
public class SigningOutputStream
    extends OutputStream
{
  protected Signature    sig_;
  protected OutputStream out_;

  /**
   * Creates and initializes a Signature given the algorithm and key
   * @param algorithm signing algorithm to use
   * @param key private key used for signing
   * @return signature initialized with algorithm and private key
   */
  private static Signature getSignature(String algorithm, Key key) {
    try {
      Signature signature = Signature.getInstance(algorithm);
      if ( key instanceof PrivateKey ) {
        signature.initSign((PrivateKey) key, SecurityUtil.GetSecureRandom());
      } else if ( key instanceof PublicKey) {
        signature.initVerify((PublicKey) key);
      }
      return signature;
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  public SigningOutputStream(Key key, OutputStream out) {
    this("SHA256with"+key.getAlgorithm(), key, out);
  }

  public SigningOutputStream(String algorithm, Key key, OutputStream out) {
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

  public boolean verify(byte[] signature) throws SignatureException {
    return sig_.verify(signature);
  }
}
