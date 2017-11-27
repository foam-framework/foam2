/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.blob;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;

public class FileBlob
    extends AbstractBlob
{
  protected long size_;
  protected File file_;
  protected FileChannel channel_;

  public FileBlob(File file) throws FileNotFoundException {
    this.file_ = file;
    this.size_ = file.length();
    this.channel_ = new FileInputStream(file).getChannel();
  }

  public File getFile() {
    return this.file_;
  }

  @Override
  public Buffer read(Buffer buffer, long offset) {
    try {
      long length = Math.min(buffer.getLength(), getSize() - offset);
      if (length < buffer.getLength()) {
        buffer = buffer.slice(0, length);
      }

      ByteBuffer bb = buffer.getData();
      int bytesRead = channel_.read(bb, offset);
      if ( bytesRead < 0 ) {
        throw new RuntimeException("Offset greater than file's current size");
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