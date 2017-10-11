/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

public class Subscription
  implements foam.core.Detachable
{
  protected boolean detached_ = false;

  public Subscription() { }

  public void detach() { detached_ = true; }

  public boolean getDetached() { return detached_; }
}
