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
  protected Logger logger;

  private static final ThreadLocal<SimpleDateFormat> sdf = new ThreadLocal<SimpleDateFormat>() {
    @Override
    protected SimpleDateFormat initialValue() {
      return new SimpleDateFormat("yyyy.MM.dd.HH.mm.ss");
    }
  };

  private ThreadLocal<StringBuilder> sb = new ThreadLocal<StringBuilder>() {
    @Override
    protected StringBuilder initialValue() {
      return new StringBuilder();
    }

    @Override
    public StringBuilder get() {
      StringBuilder b = super.get();
      b.setLength(0);
      return b;
    }
  };

  public void start() {
    logger = Logger.getAnonymousLogger();
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

  private class CustomFormatter extends Formatter {
    long   prevTime;
    String prevTimestamp;

    @Override
    public String format(LogRecord record) {
      if ( prevTime / 1000 != System.currentTimeMillis() / 1000 ) {
        prevTime = System.currentTimeMillis();
        prevTimestamp = sdf.get().format(new Timestamp(prevTime));
      }

      StringBuilder str = sb.get();

      int lev = record.getLevel().intValue();
      String msg = record.getMessage();

      str.append(prevTimestamp);
      str.append(',');

      // debug special case, fine level == 500
      if (lev == 500) {
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
