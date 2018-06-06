/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.logger;

/** Do-nothing NOP Logger which doesn't log. **/
public class NullLogger
  implements Logger
{
  private static Logger instance__ = new NullLogger();

  public static Logger instance() { return instance__; }

  private NullLogger() {}

  public void log(Object... args) { }

  public void info(Object... args) { }

  public void warning(Object... args) { }

  public void error(Object... args) { }

  public void debug(Object...  args) { }
}
