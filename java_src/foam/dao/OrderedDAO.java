package foam.dao;

import foam.core.X;
import foam.mlang.predicate.And;
import foam.mlang.predicate.Predicate;
import foam.mlang.order.Comparator;
import foam.dao.Sink;

public class OrderedDAO
  extends ProxyDAO
{
  protected foam.mlang.order.Comparator order_;

  public OrderedDAO setOrder(foam.mlang.order.Comparator order) {
    order_ = order;
    return this;
  }

  public Sink select_(X x,Sink s, Integer skip, Integer limit, Comparator order, Predicate predicate) {
    return super.select_(x, s, skip, limit, order_ == null ? order : order_, predicate);
  }

  public void removeAll_(Integer skip, Integer limit, Comparator order, Predicate predicate) {
    super.removeAll_(skip, limit, order_ == null ? order : order_, predicate);
  }
}
