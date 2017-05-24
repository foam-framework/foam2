/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

public class SingletonFactory implements XFactory {
  XFactory delegate_;
  Object instance_;

  public SingletonFactory(XFactory delegate) {
    delegate_ = delegate;
  }
  
  public Object create(X x) {
    if ( delegate_ ) {
      instance_ = delegate_.create(x);
      delegate_ = null;
    }
  
    return instance_;
  }
}
