/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.logger;

import foam.core.EmptyX;
import foam.core.X;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.NanoService;
import java.util.logging.*;
import java.text.SimpleDateFormat;
import java.io.IOException;

public class FileLogger
  extends AbstractLogger
  implements NanoService
{
  protected java.util.logging.Logger logger;

  public void start() {
    logger = java.util.logging.Logger.getAnonymousLogger();
    logger.setUseParentHandlers(false);
    logger.setLevel(Level.ALL);

    try {
      Handler handler = new FileHandler("nano.log");
      handler.setFormatter(new CustomFormatter());
      logger.addHandler(handler);
    } catch (IOException e) {
      e.printStackTrace();
    }
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

      X x = EmptyX.instance();
      User user = (User) x.get("user");
      if (user != null) 
        str.append(user.getId());
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

  public String combine(Object[] args) {
    StringBuilder str = sb.get();
    for ( Object n : args ) {
      str.append(',');
      str.append(formatArg(n));
    }
    return str.toString();
  }

  public void log(Object... args) {
    logger.info(combine(args));
  }

  public void info(Object... args) {
    logger.info(combine(args));
  }

  public void warning(Object... args) {
    logger.warning(combine(args));
  }

  public void error(Object... args) {
    logger.severe(combine(args));
  }

  // can't normally do .debug() with custom formatter: use fine instead
  public void debug(Object...  args) {
    logger.fine(combine(args));
  }
}
