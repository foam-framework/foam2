/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import java.util.ArrayList;

public class CompoundException
  extends RuntimeException
{
  private ArrayList exceptions_ = new ArrayList<RuntimeException>();

  public void add(Throwable t) {
    exceptions_.add(t);
  }

  public void maybeThrow() {
    if ( exceptions_.size() != 0 ) {
      throw this;
    }
  }
}
