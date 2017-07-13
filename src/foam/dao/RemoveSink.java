/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import foam.core.Detachable;
import foam.core.FObject;

public class RemoveSink
  extends AbstractSink {

  protected DAO dao;

  public RemoveSink(DAO dao) {
    this.dao = dao;
  }

  @Override
  public void put(FObject obj, Detachable sub) {
    dao.remove(obj);
  }
}
