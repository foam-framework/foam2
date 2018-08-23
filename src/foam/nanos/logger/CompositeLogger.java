/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.logger;

import foam.nanos.NanoService;

import java.util.ArrayList;
import java.util.List;

public class CompositeLogger
  implements Logger, NanoService
{
  public void start() throws Exception {
    for (Logger logger : childLoggers) {
      if ( logger instanceof NanoService ) {
        ((NanoService) logger).start();
      }
    };
  }

  protected List<Logger> childLoggers = new ArrayList<Logger>();

  public CompositeLogger add(Logger logger) {
    this.childLoggers.add(logger);
    return this;
  }

  public void remove(Logger logger) {
    childLoggers.remove(logger);
  }

  public void log(Object... args) {
    for ( Logger logger : childLoggers ) {
      logger.log(args);
    }
  }

  public void info(Object... args) {
    for ( Logger logger : childLoggers ) {
      logger.info(args);
    }
  }

  public void warning(Object... args) {
    for ( Logger logger : childLoggers ) {
      logger.warning(args);
    }
  }

  public void error(Object... args) {
    for ( Logger logger : childLoggers ) {
      logger.error(args);
    }
  }

  public void debug(Object...  args) {
    for ( Logger logger : childLoggers ) {
      logger.debug(args);
    }
  }

  public String toString() {
    StringBuilder sb = new StringBuilder("CompositeLogger(");

    for ( Logger logger : childLoggers ) {
      sb.append(logger);
      sb.append(",");
    }

    // remove trailing ,
    sb.setLength(sb.length()-1);

    return sb.append(")").toString();
  }
}
