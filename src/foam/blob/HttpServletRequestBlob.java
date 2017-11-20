/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.blob;

import javax.servlet.http.HttpServletRequest;
import java.io.BufferedInputStream;
import java.nio.ByteBuffer;

public class HttpServletRequestBlob
    extends foam.blob.AbstractBlob
{
  protected long size_;
  protected long pos_ = 0;
  protected HttpServletRequest request_;


  public HttpServletRequestBlob(HttpServletRequest request) {
    this.request_ = request;
    this.size_ = request.getContentLengthLong();
  }

  @Override
  public Buffer read(Buffer buffer, long offset) {
    try {
      if ( offset != pos_ ) {
        throw new Exception("Offset does not match stream position");
      }

      int outOffset = 0;
      long length = Math.min(buffer.getLength(), getSize() - offset);
      if (length < buffer.getLength()) {
        buffer = buffer.slice(0, length);
      }

      ByteBuffer bb = buffer.getData();
      BufferedInputStream bufferedInputStream = new BufferedInputStream(request_.getInputStream());
      byte[] buf = new byte[(int) length];
      while ( outOffset < length ) {
        int bytesRead = bufferedInputStream.read(buf, outOffset, (int) length);
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