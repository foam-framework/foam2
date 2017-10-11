/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.box;

import foam.core.ContextAwareSupport;
import java.util.Date;

public abstract class AbstractSkeleton
  extends    ContextAwareSupport
  implements Skeleton
{
  public byte    tobyte(Object o)   { return ((Number) o).byteValue(); }
  public double  todouble(Object o) { return ((Number) o).doubleValue(); }
  public float   tofloat(Object o)  { return ((Number) o).floatValue(); }
  public int     toint(Object o)    { return ((Number) o).intValue(); }
  public long    tolong(Object o)   { return ((Number) o).longValue(); }
  public short   toshort(Object o)  { return ((Number) o).shortValue(); }
}
