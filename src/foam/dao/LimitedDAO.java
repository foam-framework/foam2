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

  public LimitedDAO setLimit(long limit) {
    limit_ = limit;
    return this;
  }

  public Sink select_(X x, Sink s, long skip, long limit, Comparator order, Predicate predicate) {
    return super.select_(x, s, skip, limit_, order, predicate);
  }

  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    super.removeAll_(x, skip, limit_, order, predicate);
  }
}
