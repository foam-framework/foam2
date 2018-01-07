/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.blob;

import java.nio.ByteBuffer;

public class BlobBlob
    extends AbstractBlob
{
  protected int size_;
  protected byte[] blob_;

  public BlobBlob(byte[] blob) {
    size_ = blob.length;
    blob_ = new byte[blob.length];
    System.arraycopy(blob, 0, blob_, 0, blob.length);
  }

  @Override
  public Buffer read(Buffer buffer, long offset) {
    try {
      long length = Math.min(buffer.getLength(), getSize() - offset);
      if ( length < buffer.getLength() ) {
        buffer = buffer.slice(0, length);
      }

      ByteBuffer bb = buffer.getData();
      bb.put(blob_, (int) offset, (int) length);
      buffer.setData(bb);
      return buffer;
    } catch (Throwable t) {
      t.printStackTrace();
      return null;
    }
  }

  @Override
  public long getSize() {
    return size_;
  }
}