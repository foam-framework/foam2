/**
 * @license Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.dao.index;

import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;

import static foam.dao.AbstractDAO.decorateSink_;

import java.util.List;

public class OrPlan implements SelectPlan {
  protected Predicate predicate_;
  protected List<SelectPlan> planList_;

  public OrPlan(Predicate predicate, List planList) {
    predicate_ = predicate;
    planList_ = planList;
  }

  public long cost() {
    long cost = 0;
    for ( SelectPlan plan : planList_ ) {
      cost += plan.cost();
    }
    return cost;
  }

  public void select(Object state, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    if ( planList_ == null || planList_.size() == 0 )
      return;
    sink = decorateSink_(sink, skip, limit, order, predicate);
    for ( SelectPlan plan : planList_ ) {
      plan.select(state, sink, skip, limit, order, predicate);
    }
  }

}