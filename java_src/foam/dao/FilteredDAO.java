package foam.dao;

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
  public Sink select(Sink s, Integer skip, Integer limit, Comparator order, Predicate predicate) {
    return super.select(s, skip, limit, order, getPredicate(predicate));
  }

  @Override
  public void removeAll(Integer skip, Integer limit, Comparator order, Predicate predicate) {
    super.removeAll(skip, limit, order, getPredicate(predicate));
  }
}
