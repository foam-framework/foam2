package foam.blob;

import com.google.common.io.ByteStreams;

import java.io.IOException;
import java.nio.ByteBuffer;

public class InputStreamBlob
    extends foam.blob.AbstractBlob
{
  protected byte[] buffer_;

  public InputStreamBlob(java.io.InputStream in) throws IOException {
    buffer_ = ByteStreams.toByteArray(in);
  }

  @Override
  public Buffer read(Buffer buffer, long offset) {
    int length = (int) (getSize() - offset);
    return new Buffer(length, ByteBuffer.wrap(buffer_, (int) offset, length));
  }

  @Override
  public long getSize() {
    return buffer_.length;
  }
}
