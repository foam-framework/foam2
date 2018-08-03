/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

public class InvalidX
  extends AbstractX
{
  private RuntimeException exception_;

  public InvalidX(RuntimeException exception) {
    exception_ = exception;
  }

  public Object get(X x, Object key) {
    throw exception_;
  }

  public X put(Object key, Object value) {
    throw exception_;
  }

  public X putFactory(Object key, XFactory factory) {
    throw exception_;
  }

  @Override
  public String toString() {
    throw exception_;
  }
}
