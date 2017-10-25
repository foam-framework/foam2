package foam.blob;

public class InputStreamBlob {
  private java.io.InputStream stream_;

  public InputStreamBlob(java.io.InputStream stream) {
    stream_ = stream;
  }

  @Override
  public void read(Buffer buffer, long offset) {
    throw new RuntimeException("Not implemented yet.");
  }

  @Override
  public long getSize() {
    throw new RuntimeException("Can't determine size of input stream in advance");
  }
}
