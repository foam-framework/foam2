/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.logger;

public class PrefixLogger
  extends ProxyLogger
{

  protected Object[] prefix_;

  public PrefixLogger(Object[] prefix, Logger delegate) {
    prefix_ = prefix;
    setDelegate(delegate);
  }

  protected Object[] prefix(Object[] args) {
    Object[] ret = new Object[prefix_.length + args.length];

    System.arraycopy(prefix_, 0, ret, 0, prefix_.length);
    System.arraycopy(args, 0, ret, prefix_.length, args.length);

    return ret;
  }

  public void log(Object... args) {
    getDelegate().log(prefix(args));
  }

  public void info(Object... args) {
    getDelegate().info(prefix(args));
  }

  public void warning(Object... args) {
    getDelegate().warning(prefix(args));
  }

  public void error(Object... args) {
    getDelegate().error(prefix(args));
  }

  public void debug(Object...  args) {
    getDelegate().debug(prefix(args));
  }
}
