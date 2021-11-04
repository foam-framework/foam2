/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.logger;

import java.util.logging.ConsoleHandler;
import java.util.logging.Formatter;
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.LogRecord;

public class StringBufferLogger extends AbstractLogger {

  protected java.util.logging.Logger logger_; 
  
  public StringBufferLogger() {
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

      str.append(',');
      str.append(msg);
      str.append('\n');
      return str.toString();
    }
  }
  
  @Override
  public void log(Object... args) {
    logger_.info(combine(args));
  }

  @Override
  public void info(Object... args) {
    logger_.info(combine(args));
  }

  @Override
  public void warning(Object... args) {
    logger_.warning(combine(args));
  }

  @Override
  public void error(Object... args) {
    logger_.severe(combine(args));
  }

  @Override
  public void debug(Object... args) {
    logger_.fine(combine(args));
  }

}
