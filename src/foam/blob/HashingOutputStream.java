/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.blob;

import java.io.IOException;
import java.io.OutputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * HashingOutputStream
 *
 * OutputStream decorator that, given a digest, hashes incoming data before writing it
 * to the underlying OutputStream
 */
public class HashingOutputStream
    extends OutputStream
{
  protected MessageDigest digest_;
  protected OutputStream os_;

  /**
   * HashingOutputStream constructor using SHA-256 as the default digest
   * @param os OutputStream delegate
   * @throws NoSuchAlgorithmException
   */
  public HashingOutputStream(OutputStream os) throws NoSuchAlgorithmException {
    this("SHA-256", os);
  }

  /**
   * HashingOutputStream constructor allowing for user specified digest string
   * @param digest digest string
   * @param os OutputStream delegate
   * @throws NoSuchAlgorithmException
   */
  public HashingOutputStream(String digest, OutputStream os) throws NoSuchAlgorithmException {
    this(MessageDigest.getInstance(digest), os);
  }

  /**
   * HashingOutputStream constructor allowing for user specified digest object
   * @param digest digest object
   * @param os OutputStream delegate
   */
  public HashingOutputStream(MessageDigest digest, OutputStream os) {
    os_ = os;
    digest_ = digest;
  }

  /**
   * Returns the current value of the digest
   * @return digest as a byte array
   */
  public byte[] digest() {
    return digest_.digest();
  }

  @Override
  public void write(int b) throws IOException {
    digest_.update((byte) b);
    os_.write(b);
  }

  @Override
  public void write(byte[] b, int off, int len) throws IOException {
    digest_.update(b, off, len);
    os_.write(b, off, len);
  }

  @Override
  public void close() throws IOException {
    os_.close();
  }
}