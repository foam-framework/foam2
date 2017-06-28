/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.logger;

import foam.nanos.*;
import foam.core.*;
import java.util.ArrayList; 
import java.util.List; 
import java.util.logging.*;
import java.io.IOException;

public class NanoLogger
  extends    ContextAwareSupport
  implements NanoService
{
  private List<ILogger> childLoggers = new ArrayList<ILogger>();

  public void start() {
  }

  public void add(ILogger logger) {
    logger.start();
    childLoggers.add(logger);
  }

  public void remove(ILogger logger) {
    childLoggers.remove(logger);
  }

  public void log(Object... args) {
    for (ILogger logger : childLoggers) {
      logger.info(args);
    };
  }

  public void info(Object... args) {
    for (ILogger logger : childLoggers) {
      logger.info(args);
    };
  }

  public void warning(Object... args) {
    for (ILogger logger : childLoggers) {
      logger.warning(args);
    };
  }

  public void error(Object... args) {
    for (ILogger logger : childLoggers) {
      logger.error(args);
    };
  }

  public void debug(Object...  args) {
    for (ILogger logger : childLoggers) {
      logger.debug(args);
    };
  }
}
