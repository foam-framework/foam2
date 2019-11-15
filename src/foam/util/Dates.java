/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.util;

import java.text.SimpleDateFormat;

public class Dates {

  protected static SimpleDateFormat format_         = new SimpleDateFormat("yyyy.MM.dd.HH.mm.ss.SSS");
  protected static long             lastTime__      = 0;
  protected static String           lastTimestamp__ = null;

  public synchronized static String createTimestamp() {
    long now = System.currentTimeMillis();

    if ( now == lastTime__ ) {
      // reuse, NOP
    } else if ( lastTimestamp__ != null && now / 1000 == lastTime__ / 1000 ) {
      // repair
      lastTime__ = now;
      lastTimestamp__ = lastTimestamp__.substring(0, lastTimestamp__.length()-3) + String.format("%03d", now%1000);
    } else if ( now != lastTime__ ) {
      // replace
      lastTime__ = now;
      lastTimestamp__ = format_.format(now);
    }

    return lastTimestamp__;
  }

}
