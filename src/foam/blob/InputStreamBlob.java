package foam.blob;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;

public class InputStreamBlob
    extends foam.blob.AbstractBlob
{
  protected byte[] buffer_;

  public InputStreamBlob(java.io.InputStream is) throws IOException {
    int bit;
    ByteArrayOutputStream o = new ByteArrayOutputStream();
    while ( ( bit = is.read() ) != -1 ) {
      o.write(bit);
    }
    buffer_ = o.toByteArray();
  }

  @Override
  public Buffer read(Buffer buffer, long offset) {
    int length = (int) (getSize() - offset);
    ByteBuffer bb = ByteBuffer.allocate(length);
    for ( int i = (int) offset; i < length; i++ ) {
      bb.put(buffer_[i]);
    }
    return new Buffer(length, bb);
  }

  @Override
  public long getSize() {
    return buffer_.length;
  }
}
