/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.logger;

public interface Logger 
{
  public void log(Object... args);
  public void info(Object... args);
  public void warning(Object... args);
  public void error(Object... args);
  public void debug(Object... args);
}