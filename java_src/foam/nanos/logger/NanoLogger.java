/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.logger;

import foam.core.*;
import foam.nanos.NanoService;
import java.util.logging.*;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.io.IOException;

public class NanoLogger
  extends    ContextAwareSupport
  implements NanoService
{
  protected Logger       logger;
  protected StringBuffer sb = new StringBuffer();

  private static final ThreadLocal<SimpleDateFormat> sdf = new ThreadLocal<SimpleDateFormat>() {
    @Override
    protected SimpleDateFormat initialValue() {
      return new SimpleDateFormat("yyyy.MM.dd.HH.mm.ss");
    }
  };

  public void start() {
    logger = Logger.getAnonymousLogger();
    logger.setUseParentHandlers(false);
    logger.setLevel(Level.ALL);

    sb = new StringBuffer();

    try {
      Handler handler = new FileHandler("nano.log");
      handler.setFormatter(new CustomFormatter());
      logger.addHandler(handler);
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private class CustomFormatter extends Formatter {
    long   prevTime;
    String prevTimestamp;

    @Override
    public String format(LogRecord record) {
      if ( prevTime / 1000 != System.currentTimeMillis() / 1000 ) {
        prevTime = System.currentTimeMillis();
        prevTimestamp = sdf.get().format(new Timestamp(prevTime));
      }

      sb.setLength(0);
      int lev = record.getLevel().intValue();
      String msg = record.getMessage();

      sb.append(prevTimestamp);
      sb.append(',');

      // debug special case, fine level == 500
      if (lev == 500) {
        sb.append("DEBUG");
      } else {
        sb.append(record.getLevel());
      }

      sb.append(',');
      sb.append(msg);
      sb.append('\n');
      return sb.toString();
    }
  }

  public void log(String msg) {
    logger.info(msg);
  }

  public void info(String msg) {
    logger.info(msg);
  }

  public void warning(String msg) {
    logger.warning(msg);
  }

  public void error(String msg) {
    logger.severe(msg);
  }

  // can't normally do .debug() with custom formatter: use fine instead
  public void debug(String msg) {
    logger.fine(msg);
  }
}
