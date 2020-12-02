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

public class AltFindPlan implements FindPlan {
  protected Object   state_;
  protected FindPlan bestPlan_ = NotFoundPlan.instance();

  public AltFindPlan(Object state, FindPlan bestPlan){
    state_    = state;
    bestPlan_ = bestPlan;
  }

  public FObject find(Object state, Object key){
    return bestPlan_.find(state_, key);
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
