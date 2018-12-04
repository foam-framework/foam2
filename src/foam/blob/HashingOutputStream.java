/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.blob;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * HashingOutputStream
 *
 * OutputStream decorator that hashes all data written to the underlying OutputStream
 */
public class HashingOutputStream
  extends OutputStream
{
  protected OutputStream os_;
  protected MessageDigest digest_;

  /**
   * HashingOutputStream constructor using SHA-256 as the default algorithm
   * and a ByteArrayOutputStream as the delegate
   * @throws NoSuchAlgorithmException
   */
  public HashingOutputStream() throws NoSuchAlgorithmException {
    this("SHA-256", new ByteArrayOutputStream());
  }

  /**
   * HashingOutputStream constructor with user provided algorithm
   * that uses a ByteArrayOutputStream as the delegate
   * @throws NoSuchAlgorithmException
   */
  public HashingOutputStream(String algorithm) throws NoSuchAlgorithmException {
    this(algorithm, new ByteArrayOutputStream());
  }

  /**
   * HashingOutputStream constructor using SHA-256 as the default algorithm
   * @param os OutputStream delegate
   * @throws NoSuchAlgorithmException
   */
  public HashingOutputStream(OutputStream os) throws NoSuchAlgorithmException {
    this("SHA-256", os);
  }

  /**
   * HashingOutputStream constructor allowing for user specified algorithm
   * @param algorithm hashing algorithm
   * @param os OutputStream delegate
   * @throws NoSuchAlgorithmException
   */
  public HashingOutputStream(String algorithm, OutputStream os) throws NoSuchAlgorithmException {
    this(MessageDigest.getInstance(algorithm), os);
  }

  /**
   * HashingOutputStream constructor allowing for user specified digest
   * @param digest digest object
   * @param os OutputStream delegate
   */
  public HashingOutputStream(MessageDigest digest, OutputStream os) {
    os_ = os;
    digest_ = digest;
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
