/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.util;

/**
 * Quickly generate String timestamps by reusing or repairing the last
 * generated timestamp. If the time hasn't changed, then just reuse
 * the last timestamp string. If the second is the same but only
 * the milliseconds are different, then just update the ms portion of
 * the timestamp.
 *
 * Is a synchronized / thread-safe of FastTimestamper.
 **/
public class SyncFastTimestamper
  extends FastTimestamper
{

  public SyncFastTimestamper() {
    super();
  }

  public synchronized String createTimestamp() {
    return super.createTimestamp();
  }

}
