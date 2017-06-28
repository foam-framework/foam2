package foam.dao;

import foam.core.X;
import foam.mlang.predicate.And;
import foam.mlang.predicate.Predicate;
import foam.mlang.order.Comparator;
import foam.dao.Sink;

public class SkipDAO
  extends ProxyDAO
{
  protected long skip_;

  public SkipDAO setSkip(long skip) {
    skip_ = skip;
    return this;
  }

  public Sink select_(X x, Sink s, long skip, long limit, Comparator order, Predicate predicate) {
    return super.select_(x, s, skip_, limit, order, predicate);
  }

  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    super.removeAll_(x, skip_, limit, order, predicate);
  }
}
