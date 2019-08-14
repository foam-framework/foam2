/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.blob;

public class FileBlob extends AbstractBlob {
  public static final int BUFFER_SIZE = 4096;

  private java.io.File file_;
  private java.io.RandomAccessFile raf_;

  public FileBlob(java.io.File file) throws java.io.IOException {
    file_ = file;
    raf_ = new java.io.RandomAccessFile(file.getPath(), "r");
  }

  public java.io.File getFile() {
    return this.file_;
  }

  @Override
  public long read(java.io.OutputStream out, long offset, long length) {
    try {
      byte[] buffer = new byte[BUFFER_SIZE];
      raf_.seek(offset);
      long read = 0;
      while ( read < length ) {
        int n = raf_.read(buffer, 0,
          Math.min((int)(length - read), BUFFER_SIZE));
        out.write(buffer, 0, n);
        read += n;
      }
      return read;
    } catch (Throwable t) {
      return -1;
    }
  }

  @Override
  public long getSize() {
    return file_.length();
  }
}
