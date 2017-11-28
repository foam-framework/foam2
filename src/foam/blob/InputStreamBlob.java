/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.blob;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.ByteBuffer;

public class InputStreamBlob
    extends foam.blob.AbstractBlob
{
  protected long size_;
  protected long pos_ = 0;
  protected InputStream in_;

  public InputStreamBlob(java.io.InputStream in, long size) throws IOException {
    this.size_ = size;
    this.in_ = new BufferedInputStream(in);
  }

  public InputStream getInputStream() {
    return in_;
  }

  @Override
  public Buffer read(Buffer buffer, long offset) {
    try {
      if ( offset != pos_ ) {
        throw new RuntimeException("Offset does not match stream position");
      }

      int outOffset = 0;
      long length = Math.min(buffer.getLength(), getSize() - offset);
      if ( length < buffer.getLength() ) {
        buffer = buffer.slice(0, length);
      }

      ByteBuffer bb = buffer.getData();
      byte[] buf = new byte[(int) length];
      while ( outOffset < length ) {
        int bytesRead = in_.read(buf, outOffset, (int) length);
        bb.put(buf, outOffset, bytesRead);
        outOffset += bytesRead;
        pos_ += bytesRead;
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
