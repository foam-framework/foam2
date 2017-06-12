package foam.dao;

import foam.core.X;
import foam.mlang.predicate.And;
import foam.mlang.predicate.Predicate;
import foam.mlang.order.Comparator;
import foam.dao.Sink;

public class SkipDAO
  extends ProxyDAO
{
  protected int skip_;

  public SkipDAO setSkip(int skip) {
    skip_ = skip;
    return this;
  }

  public Sink select_(X x, Sink s, Long skip, Long limit, Comparator order, Predicate predicate) {
    return super.select_(x, s, Long.valueOf(skip_), limit, order, predicate);
  }

  public void removeAll_(X x, Long skip, Long limit, Comparator order, Predicate predicate) {
    super.removeAll_(x, Long.valueOf(skip_), limit, order, predicate);
  }
}
