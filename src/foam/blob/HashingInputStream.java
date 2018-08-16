/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.blob;

import java.io.IOException;
import java.io.InputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * HashingInputStream
 *
 * InputStream decorator that hashes all read data from the underlying InputStream
 *
 */
public class HashingInputStream
  extends InputStream
{
  protected InputStream is_;
  protected MessageDigest digest_;

  /**
   * HashingInputStream constructor using SHA-256 as the default algorithm
   * @param is InputStream delegate
   * @throws NoSuchAlgorithmException
   */
  public HashingInputStream(InputStream is) throws NoSuchAlgorithmException {
    this("SHA-256", is);
  }

  /**
   * HashingInputStream constructor allowing for user specified algorithm
   * @param algorithm hashing algorithm
   * @param is InputStream delegate
   * @throws NoSuchAlgorithmException
   */
  public HashingInputStream(String algorithm, InputStream is) throws NoSuchAlgorithmException {
    this(MessageDigest.getInstance(algorithm), is);
  }

  /**
   * HashingInputStream constructor allowing for user specified digest
   * @param digest digest object
   * @param is InputStream delegate
   */
  public HashingInputStream(MessageDigest digest, InputStream is) {
    is_ = is;
    digest_ = digest;
  }

  @Override
  public int read() throws IOException {
    int byteRead = is_.read();
    if ( byteRead != -1 ) {
      digest_.update((byte) byteRead);
    }
    return byteRead;
  }

  @Override
  public int read(byte[] b, int off, int len) throws IOException {
    int bytesRead = is_.read(b, off, len);
    if ( bytesRead != -1 ) {
      digest_.update(b, off, bytesRead);
    }
    return bytesRead;
  }

  @Override
  public void close() throws IOException {
    is_.close();
  }

  /**
   * Returns the output of the hash function
   * @return hash function output
   */
  public byte[] digest() {
    return digest_.digest();
  }

  /**
   * Resets the digest
   */
  public void reset() {
    digest_.reset();
  }
}
