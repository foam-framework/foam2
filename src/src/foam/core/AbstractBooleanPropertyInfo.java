/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

public abstract class AbstractBooleanPropertyInfo
  extends AbstractPropertyInfo
{
  public int compareValues(boolean b1, boolean b2) {
    return Boolean.compare(b1, b2);
  }
}
