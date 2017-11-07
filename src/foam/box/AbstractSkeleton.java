/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.box;

import foam.box.Message;
import foam.core.ContextAwareSupport;
import foam.core.X;
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

  /** Return context stored in message if present, otherwise getX(). */
  public X getMessageX(Message msg) {
    X x = (X) msg.getLocalAttributes().get("x");

    return x == null ? getX() : x;
  }
}
