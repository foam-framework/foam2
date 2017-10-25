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

import java.nio.ByteBuffer;

public class ByteArrayBlob
    extends AbstractBlob
{
  protected Buffer buffer_;

  public ByteArrayBlob(byte[] data) {
    this.buffer_ = new Buffer(data.length, ByteBuffer.wrap(data));
  }

  @Override
  public Buffer read(Buffer buffer, long offset) {
    if ( offset == 0 ) {
      return buffer_;
    }
    return buffer_.slice(offset, getSize());
  }

  @Override
  public long getSize() {
    return buffer_.getLength();
  }
}