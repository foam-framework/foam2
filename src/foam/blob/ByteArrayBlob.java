/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.blob;

import java.io.OutputStream;

public class ByteArrayBlob
    extends AbstractBlob
{
  protected int size_;
  protected byte[] blob_;

  public ByteArrayBlob(byte[] blob) {
    size_ = blob.length;
    blob_ = new byte[blob.length];
    System.arraycopy(blob, 0, blob_, 0, blob.length);
  }

  @Override
  public int read(OutputStream out, int offset, int length) {
    try {
      length = Math.min(length, getSize() - offset);
      out.write(blob_, offset, length);
      return length;
    } catch (Throwable t) {
      return -1;
    }
  }

  @Override
  public int getSize() {
    return size_;
  }
}