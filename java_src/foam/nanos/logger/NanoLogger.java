package foam.nanos.logger;

import foam.core.*;
import foam.nanos.NanoService;

import java.text.SimpleDateFormat;
import java.sql.Timestamp;
import java.io.IOException;
import java.util.logging.*;

public class NanoLogger extends ContextAwareSupport implements NanoService {
  private static final SimpleDateFormat sdf = new SimpleDateFormat("yyyy.MM.dd.HH.mm.ss");
  static Logger logger;

  public void start() {
    logger = Logger.getAnonymousLogger();
    logger.setUseParentHandlers(false);
    try {
      Handler handler = new FileHandler("nano.log");
      handler.setFormatter(new CustomFormatter());
      logger.addHandler(handler);
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private static class CustomFormatter extends Formatter {
    long prevTime;
    String prevTimestamp;
    @Override
    public String format(LogRecord record) {
      if (prevTime / 1000 != System.currentTimeMillis() / 1000) {
        prevTime = System.currentTimeMillis();
        prevTimestamp = sdf.format(new Timestamp(prevTime));
      }

      StringBuffer sb = new StringBuffer();
      int level = record.getLevel().intValue();
      String msg = record.getMessage();

      sb.append("[");
      sb.append(prevTimestamp);
      sb.append("] ");
      sb.append("[");

      if (level == 1000) {
        sb.append("ERROR]   |  ");
      } else if (level == 900) {
        if (msg.substring(0, Math.min(msg.length(), 9)).equals("u001B[35m")) {
          sb.append("DEBUG]   |  ");
          msg = msg.substring(9, msg.length());
        } else {
          // warning
          sb.append(record.getLevel());
          sb.append("] |  ");
        }
      } else {
        // info
        sb.append(record.getLevel());
        sb.append("]    |  ");
      }

      sb.append(msg);
      sb.append('\n');
      return sb.toString();
    }
  }

  public static void log(String msg) {
    logger.info(msg);
  }

  public static void info(String msg) {
    logger.info(msg);
  }

  public static void warning(String msg) {
    logger.warning(msg);
  }

  public static void error(String msg) {
    logger.severe(msg);
  }

  // can't normally do .debug() with custom formatter: append prefix to indicate debug
  public static void debug(String msg) {
    logger.warning("u001B[35m" + msg);
  }
}