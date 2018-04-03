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
import foam.dao.ArraySink;
import foam.dao.Sink;

public class OrderedDAO
  extends ProxyDAO
{
  protected foam.mlang.order.Comparator order_;

  public OrderedDAO(Comparator order, DAO delegate) {
    order_ = order;
    setDelegate(delegate);
  }

  public OrderedDAO setOrder(foam.mlang.order.Comparator order) {
    order_ = order;
    return this;
  }

  public Sink select_(X x, Sink s, long skip, long limit, Comparator order, Predicate predicate) {
    s = prepareSink(s);
    return super.select_(x, s, skip, limit, order == null ? order_ : order, predicate);
  }

  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    super.removeAll_(x, skip, limit, order == null ? order_ : order, predicate);
  }
}
