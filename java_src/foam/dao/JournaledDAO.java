/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import foam.core.FObject;
import foam.core.X;
import java.io.IOException;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;

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
  public FObject find_(X x, Object id) {
    return null;
  }

  @Override
  public Sink select_(X x, Sink sink, Integer skip, Integer limit, Comparator order, Predicate predicate) {
    return null;
  }

  @Override
  public void removeAll_(X x, Integer skip, Integer limit, Comparator order, Predicate predicate) {
    journal.removeAll();
    getDelegate().removeAll_(x, skip, limit, order, predicate);
  }
}
