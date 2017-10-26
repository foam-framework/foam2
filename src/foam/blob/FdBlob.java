package foam.blob;

import com.google.common.io.ByteStreams;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.nio.ByteBuffer;

public class FdBlob
    extends AbstractBlob
{
  protected File file_;
  protected long size_;

  public FdBlob(File file) {
    this.file_ = file;
    this.size_ = file.length();
  }

  @Override
  public Buffer read(Buffer buffer, long offset) {
    try {
      long length = Math.min(buffer.getLength(), getSize() - offset);
      if (length < buffer.getLength()) {
        buffer = buffer.slice(0, length);
      }

      ByteBuffer bb = buffer.getData();
      FileInputStream fileInputStream = new FileInputStream(file_);
      BufferedInputStream bufferedInputStream = new BufferedInputStream(fileInputStream);
      // skip amount of bytes specified in offset
      bufferedInputStream.skip(offset);
      bb.put(ByteStreams.toByteArray(bufferedInputStream));
      buffer.setData(bb);

      return buffer;
    } catch (Throwable t) {
      t.printStackTrace();
      return null;
    }
  }

  @Override
  public long getSize() {
    return this.size_;
  }
}