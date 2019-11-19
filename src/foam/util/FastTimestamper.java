/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.util;

import java.text.SimpleDateFormat;

/**
 * Quickly generate String timestamps by reusing or repairing the last
 * generated timestamp. If the time hasn't changed, then just reuse
 * the last timestamp string. If the second is the same but only
 * the milliseconds are different, then just update the ms portion of
 * the timestamp.
 *
 * Is not synchronized / thread-safe. Only use when synchronized by
 * containment or only used by a single thread.
 *
 * Use SyncFastTimestamper when thread-safety is required.
 **/
public class FastTimestamper {

  protected SimpleDateFormat format_        = new SimpleDateFormat("yyyy.MM.dd.HH.mm.ss.SSS");
  protected long             lastTime_      = 0;
  protected String           lastTimestamp_ = null;

  public FastTimestamper() {
    lastTime_      = System.currentTimeMillis();
    lastTimestamp_ = format_.format(lastTime_);
  }

  public String createTimestamp() {
    long now = System.currentTimeMillis();

    if ( now == lastTime_ ) {
      // reuse, NOP
    } else if ( now / 1000 == lastTime_ / 1000 ) {
      // repair
      lastTime_ = now;
      lastTimestamp_ = lastTimestamp_.substring(0, lastTimestamp_.length()-3) + String.format("%03d", now%1000);
    } else if ( now != lastTime_ ) {
      // replace
      lastTime_ = now;
      lastTimestamp_ = format_.format(now);
    }

    return lastTimestamp_;
  }

}
