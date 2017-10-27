package foam.blob;

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

  public File getFile() {
    return this.file_;
  }

  @Override
  public Buffer read(Buffer buffer, long offset) {
    try {
      int outOffset = 0;

      long length = Math.min(buffer.getLength(), getSize() - offset);
      if (length < buffer.getLength()) {
        buffer = buffer.slice(0, length);
      }

      ByteBuffer bb = buffer.getData();
      FileInputStream fileInputStream = new FileInputStream(file_);
      BufferedInputStream bufferedInputStream = new BufferedInputStream(fileInputStream);
      bufferedInputStream.skip(offset);

      byte[] buf = new byte[(int) length];
      while ( outOffset < length ) {
        int bytesRead = bufferedInputStream.read(buf, outOffset, (int) length);
        bb.put(buf, outOffset, bytesRead);
        outOffset += bytesRead;
      }

      bb.rewind();
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