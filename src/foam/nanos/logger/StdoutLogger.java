/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.logger;

import foam.nanos.logger.Logger;
import foam.nanos.NanoService;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.logging.*;

public class StdoutLogger
  extends AbstractLogger
{
  protected java.util.logging.Logger logger_;

  public StdoutLogger() {
    logger_ = java.util.logging.Logger.getAnonymousLogger();
    logger_.setUseParentHandlers(false);
    logger_.setLevel(Level.ALL);
    Handler handler = new ConsoleHandler();
    handler.setLevel(Level.ALL);
    handler.setFormatter(new CustomFormatter());
    logger_.addHandler(handler);
  }

  protected class CustomFormatter extends Formatter {
    long   prevTime;
    String prevTimestamp;

    @Override
    public String format(LogRecord record) {
      int           lev = record.getLevel().intValue();
      String        msg = record.getMessage();
      StringBuilder str = sb.get();

      if ( prevTime / 1000 != System.currentTimeMillis() / 1000 ) {
        prevTime = System.currentTimeMillis();
        prevTimestamp = sdf.get().format(prevTime);
      }

      str.append(prevTimestamp);
      str.append(',');

      // debug special case, fine level == 500
      if ( lev == 500 ) {
        str.append("DEBUG");
      } else {
        str.append(record.getLevel());
      }

      str.append(msg);
      str.append('\n');
      return str.toString();
    }
  }

  public void log(Object... args) {
    logger_.info(combine(args));
  }

  public void info(Object... args) {
    logger_.info(combine(args));
  }

  public void warning(Object... args) {
    logger_.warning(combine(args));
  }

  public void error(Object... args) {
    logger_.severe(combine(args));
  }

  // can't normally do .debug() with custom formatter: use fine instead
  public void debug(Object...  args) {
    logger_.fine(combine(args));
  }
}
