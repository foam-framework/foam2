/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

public abstract class AbstractBytePropertyInfo
  extends AbstractPropertyInfo
{
  public int compareValues(byte b1, byte b2) {
    return java.lang.Byte.compare(b1, b2);
  }
}
