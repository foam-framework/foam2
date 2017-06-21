/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

public abstract class AbstractStringPropertyInfo
  extends AbstractPropertyInfo
{
  public int compareValues(String o1, String o2) {
    return o1.compareTo(o2);
  }

  public abstract int getWidth();
}
