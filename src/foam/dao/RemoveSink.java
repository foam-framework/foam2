/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import foam.core.Detachable;
import foam.core.FObject;
import foam.core.X;

public class RemoveSink
  extends AbstractSink
{
  protected X   x_;
  protected DAO dao_;

  public RemoveSink(X x, DAO dao) {
    x_   = x;
    dao_ = dao;
  }

  @Override
  public void put(Object obj, Detachable sub) {
    dao_.remove_(x_, (FObject)obj);
  }
}
