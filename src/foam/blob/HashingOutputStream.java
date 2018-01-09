package foam.blob;

import java.io.IOException;
import java.io.OutputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class HashingOutputStream
    extends OutputStream
{
  protected MessageDigest digest_;
  protected OutputStream os_;

  public HashingOutputStream(OutputStream os) throws NoSuchAlgorithmException {
    this("SHA-256", os);
  }

  public HashingOutputStream(String digest, OutputStream os) throws NoSuchAlgorithmException {
    this(MessageDigest.getInstance(digest), os);
  }

  public HashingOutputStream(MessageDigest digest, OutputStream os) {
    os_ = os;
    digest_ = digest;
  }

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