/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

public abstract class AbstractIntPropertyInfo
  extends AbstractPropertyInfo
{
  public int compareValues(int o1, int o2) {
    return Integer.compare(o1, o2);
  }
}
