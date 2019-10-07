/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.blob;

import java.io.*;

public class InputStreamBlob
    extends AbstractBlob
{
  public static final int BUFFER_SIZE = 4096;

  protected long size_;
  protected long pos_ = 0;
  protected InputStream in_;

  public InputStreamBlob(InputStream in, long size) {
    size_ = size;
    in_ = in;
  }

  public InputStream getInputStream() {
    return in_;
  }

  @Override
  public long read(OutputStream out, long offset, long length) {
    try {
      if ( offset != pos_ ) {
        throw new RuntimeException("Offset does not match stream position");
      }

      long read = 0;
      byte[] buffer = new byte[BUFFER_SIZE];
      while ( read < length ) {
        int n = in_.read(buffer, 0,
          Math.min((int)(length - read), buffer.length));
        if ( n == -1 ) break;
        out.write(buffer, 0, n);
        read += n;
      }

      pos_ += read;
      return read;
    } catch (Throwable t) {
      return -1;
    }
  }

  @Override
  public long getSize() {
    return size_;
  }

  @Override
  protected void finalize() throws Throwable {
    in_.close();
  }
}
