/**
 * @license Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.dao.index;

import foam.dao.AbstractDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;

import static foam.dao.AbstractDAO.decorateDedupSink_;
import static foam.dao.AbstractDAO.decorateSink;

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
    sink = decorateSink(null, sink, skip, limit, order, null);
    sink = decorateDedupSink_(sink);
    for ( SelectPlan plan : planList_ ) {
      plan.select(state, sink, 0, AbstractDAO.MAX_SAFE_INTEGER, null, null);
    }
    sink.eof();
  }

  @Override
  public String toString() {
    var sb = new StringBuilder();
    sb.append("or(");
    for ( int i = 0; i < planList_.size(); i++ ) {
      if ( i > 0 ) sb.append(", ");
      sb.append(planList_.get(i).toString());
    }
    sb.append(")");
    return sb.toString();
  }
}
