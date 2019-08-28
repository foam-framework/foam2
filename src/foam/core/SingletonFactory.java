/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

public class SingletonFactory
  implements XFactory
{
  XFactory delegate_ = null;
  Object   instance_;

  public SingletonFactory(XFactory delegate) {
    delegate_ = delegate;
  }

  public synchronized Object create(X x) {
    if ( delegate_ != null ) {
      XFactory delegate = delegate_;
      setDelegate(null);
      instance_ = delegate.create(x);
    }

    return instance_;
  }

  public synchronized void setDelegate(XFactory delegate) {
    delegate_ = delegate;
  }
}
