package foam.dao;

import foam.core.X;
import foam.mlang.predicate.Predicate;
import foam.mlang.order.Comparator;

public class FilteredDAO
  extends ProxyDAO
{
  protected Predicate predicate_;

  public FilteredDAO setPredicate(Predicate predicate) {
    predicate_ = predicate;
    return this;
  }

  private Predicate getPredicate(Predicate arg) {
    return arg == null ? predicate_ : foam.mlang.MLang.AND(predicate_, arg);
  }

  @Override
  public Sink select_(X x, Sink s, Integer skip, Integer limit, Comparator order, Predicate predicate) {
    return super.select_(x, s, skip, limit, order, getPredicate(predicate));
  }

  @Override
  public void removeAll_(Integer skip, Integer limit, Comparator order, Predicate predicate) {
    super.removeAll_(skip, limit, order, getPredicate(predicate));
  }
}
