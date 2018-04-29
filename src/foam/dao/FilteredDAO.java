/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import foam.core.X;
import foam.mlang.predicate.Predicate;
import foam.mlang.order.Comparator;

public class FilteredDAO
  extends ProxyDAO
{
  protected Predicate predicate_;

  public FilteredDAO(Predicate predicate, DAO delegate) {
    predicate_ = predicate;
    setDelegate(delegate);
    if ( delegate instanceof ProxyDAO ) {
      setX(((ProxyDAO)delegate).getX());
    }
  }

  public FilteredDAO(X x, Predicate predicate, DAO delegate) {
    predicate_ = predicate;
    setX(x);
    setDelegate(delegate);
  }

  public FilteredDAO() {}

  public void setPredicate(Predicate predicate) {
    predicate_ = predicate;
  }

  private Predicate getPredicate(Predicate arg) {
    return arg == null ? predicate_ : foam.mlang.MLang.AND(predicate_, arg);
  }

  @Override
  public Sink select_(X x, Sink s, long skip, long limit, Comparator order, Predicate predicate) {
    return super.select_(x, s, skip, limit, order, getPredicate(predicate));
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    super.removeAll_(x, skip, limit, order, getPredicate(predicate));
  }

  @Override
  public void listen_(X x, Sink sink, Predicate predicate) {
    super.listen_(x, sink, getPredicate(predicate));
  }
}
