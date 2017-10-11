/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

public class ContextAwareSupport
  implements ContextAware
{
  protected X x_;

  public X    getX() { return x_; }
  public void setX(X x) { x_ = x; }
}
