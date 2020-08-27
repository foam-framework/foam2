/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.dao.index;

import foam.core.FObject;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Not;
import foam.mlang.predicate.Predicate;

public class AltSelectPlan
  implements SelectPlan
{
  protected Object     state_;
  protected SelectPlan bestPlan_ = NotFoundPlan.instance();

  public AltSelectPlan(Object state, SelectPlan bestPlan){
    state_    = state;
    bestPlan_ = bestPlan;
  }

  public void select(Object state, Sink sink, long skip, long limit, Comparator order, Predicate predicate){
    bestPlan_.select(state_,sink,skip,limit,order,predicate);
  }

  @Override
  public long cost() {
    return bestPlan_.cost();
  }

  @Override
  public String toString() {
    return bestPlan_.toString();
  }
}
