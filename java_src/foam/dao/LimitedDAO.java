package foam.dao;

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

  public Sink select_(Sink s, Integer skip, Integer limit, Comparator order, Predicate predicate) {
    return super.select_(s, skip, limit_, order, predicate);
  }

  public void removeAll(Integer skip, Integer limit, Comparator order, Predicate predicate) {
    super.removeAll(skip, limit_, order, predicate);
  }
}
