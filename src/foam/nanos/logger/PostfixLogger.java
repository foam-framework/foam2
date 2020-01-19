/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.logger;

public class PostfixLogger
  extends ProxyLogger
{

  protected Object[] postfix_;

  public PostfixLogger(Object[] postfix, Logger delegate) {
    postfix_ = postfix;
    setDelegate(delegate);
  }

  protected Object[] postfix(Object[] args) {
    Object[] ret = new Object[postfix_.length + args.length];

    System.arraycopy(args, 0, ret, 0, args.length);
    System.arraycopy(postfix_, 0, ret, args.length, postfix_.length);

    return ret;
  }
 
  public void log(Object... args) {
    getDelegate().log(postfix(args));
  }

  public void info(Object... args) {
    getDelegate().info(postfix(args));
  }

  public void warning(Object... args) {
    getDelegate().warning(postfix(args));
  }

  public void error(Object... args) {
    getDelegate().error(postfix(args));
  }

  public void debug(Object...  args) {
    getDelegate().debug(postfix(args));
  }
}
