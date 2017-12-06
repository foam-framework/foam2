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
  protected Object state_;
  protected Plan bestPlan_ = new NotFoundPlan();

  public AltFindPlan(Object state, Plan bestPlan){
    state_ = state;
    bestPlan_ = bestPlan;
  }
  public Plan getPlan(){
    return bestPlan_;
  }

  public Object getState() {
    return state_;
  }
  public FObject find(Object state, Object key){
    return ((FindPlan)bestPlan_).find(state_,key);
  }

  @Override
  public long cost() {
    return bestPlan_.cost();
  }
}