/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

/** Last-resort method of locating thread-local session context. **/
public class XLocator
{

  protected static ThreadLocal<ProxyX> x__ = new ThreadLocal<ProxyX>() {
    protected ProxyX initialValue() {
      return new ProxyX();
    }
  };

  public static X set(X x) {
    x__.get().setX(x);
    return x;
  }

  public static X get() {
    return x__.get();
  }

}
