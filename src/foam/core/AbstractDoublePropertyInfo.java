/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

public abstract class AbstractDoublePropertyInfo
  extends AbstractPropertyInfo
{
  public int compareValues(double d1, double d2) {
    return Double.compare(d1, d2);
  }
  
  public int comparePropertyValue(Object key, FObject o) {
    return compareValues((double) key, (double) f(o));
  }
}
