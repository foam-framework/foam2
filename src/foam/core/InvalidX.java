/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import foam.nanos.logger.Logger;

public class InvalidX
  extends ProxyX
{
  private X delegate_;
  private String nspecName_;
  private Logger logger_;

  public InvalidX(X delegate, String nspecName, Logger logger) {
    super(delegate);
    delegate_ = delegate;
    nspecName_ = nspecName;
    logger_ = logger;
  }

  @Override
  public Object get(X x, Object key) {
    logger_.warning("Unsafe access to " + nspecName_ + ". Please use .inX() instead.");
    return super.get(x, key);
  }

  @Override
  public X put(Object key, Object value) {
    logger_.warning("Unsafe access to " + nspecName_ + ". Please use .inX() instead.");
    return super.put(key, value);
  }

  @Override
  public X putFactory(Object key, XFactory factory) {
    logger_.warning("Unsafe access to " + nspecName_ + ". Please use .inX() instead.");
    return super.putFactory(key, factory);
  }
}
