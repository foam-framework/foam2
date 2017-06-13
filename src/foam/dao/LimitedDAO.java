package foam.dao;

import foam.core.X;
import foam.mlang.predicate.And;
import foam.mlang.predicate.Predicate;
import foam.mlang.order.Comparator;
import foam.dao.Sink;

public class LimitedDAO
  extends ProxyDAO
{
  protected int limit_;

  public LimitedDAO setLimit(int limit) {
    limit_ = limit;
    return this;
  }

  public Sink select_(X x, Sink s, Long skip, Long limit, Comparator order, Predicate predicate) {
    return super.select_(x, s, skip, Long.valueOf(limit_), order, predicate);
  }

  public void removeAll_(X x, Long skip, Long limit, Comparator order, Predicate predicate) {
    super.removeAll_(x, skip, Long.valueOf(limit_), order, predicate);
  }
}
