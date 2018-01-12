/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.blob;

import java.io.ByteArrayInputStream;

public class ByteArrayBlob
    extends ProxyBlob
{
  public ByteArrayBlob(byte[] blob) {
    setDelegate(new InputStreamBlob(new ByteArrayInputStream(blob), blob.length));
  }
}