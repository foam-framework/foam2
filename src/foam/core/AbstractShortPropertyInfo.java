/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

public abstract class AbstractShortPropertyInfo
  extends AbstractPropertyInfo
{
  public int compareValues(short o1, short o2) {
    return Short.compare(o1, o2);
  }
}
