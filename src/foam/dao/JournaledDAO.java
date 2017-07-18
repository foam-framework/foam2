/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import foam.core.ClassInfo;
import foam.core.Detachable;
import foam.core.FObject;
import foam.core.X;
import foam.mlang.predicate.Predicate;
import java.io.IOException;
import foam.mlang.order.Comparator;

public class JournaledDAO
  extends ProxyDAO
{
  protected FileJournal journal;

  public JournaledDAO(DAO delegate, String filename) throws IOException {
    journal = new FileJournal(filename);
    setDelegate(delegate);
    journal.replay(delegate);
  }

  /**
   * persists data into FileJournal then calls the delegated DAO.
   *
   * @param obj
   * @returns FObject
   */
  @Override
  public FObject put_(X x, FObject obj) {
    journal.put(obj, null);
    return getDelegate().put_(x, obj);
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    Object id = ((AbstractDAO) getDelegate()).getPrimaryKey().get(obj);
    journal.remove(id, null);
    return getDelegate().remove_(x, obj);
  }

  @Override
  public void removeAll_(final X x, long skip, final long limit, Comparator order, Predicate predicate) {
    getDelegate().select_(x, new RemoveSink(this), skip, limit, order, predicate);
    getDelegate().removeAll_(x, skip, limit, order, predicate);
  }
}
