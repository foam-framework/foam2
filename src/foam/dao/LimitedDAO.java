/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import foam.core.X;
import foam.mlang.predicate.And;
import foam.mlang.predicate.Predicate;
import foam.mlang.order.Comparator;
import foam.dao.Sink;

public class LimitedDAO
  extends ProxyDAO
{
  protected long limit_;

  public LimitedDAO(long limit, DAO delegate) {
    limit_ = limit;
    setDelegate(delegate);
  }

  public LimitedDAO setLimit(long limit) {
    limit_ = limit;
    return this;
  }

  public Sink select_(X x, Sink s, long skip, long limit, Comparator order, Predicate predicate) {
    s = prepareSink(s);
    return super.select_(x, s, skip, limit_, order, predicate);
  }

  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    super.removeAll_(x, skip, limit_, order, predicate);
  }
}
