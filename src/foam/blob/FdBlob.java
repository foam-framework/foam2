/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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