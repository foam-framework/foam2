/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.dao.index;

import java.util.ArrayList;

import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;

public class AltPlan implements SelectPlan {
  protected ArrayList<Plan> subPlans = new ArrayList<Plan>();
  
  public long cost() {
    long cost = 1;
    if ( subPlans.size() > 0 ) {
      cost = subPlans.get(0).cost();
    }
    for ( Plan plan : subPlans ) {
      if ( cost > plan.cost() ) {
        cost = plan.cost();
      }
    }
    return cost;
  }

  public void select(Object state, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    for ( Plan plan : subPlans ) {
      if ( plan instanceof SelectPlan ) {
        ((SelectPlan) plan).select(state, sink, skip, limit, order, predicate);
      }
    }
  }

}
