package foam.dao.index;

import foam.core.FObject;

import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Not;
import foam.mlang.predicate.Predicate;

public class AltSelectPlan implements SelectPlan {
  protected Object state_;
  protected Plan bestPlan_ = new NotFoundPlan();

  public AltSelectPlan(Object state, Plan bestPlan){
    state_ = state;
    bestPlan_ = bestPlan;
  }

  public Plan getPlan(){
    return bestPlan_;
  }

  public Object getState() {
    return state_;
  }

  public void select(Object state, Sink sink, long skip, long limit, Comparator order, Predicate predicate){
      ((SelectPlan)bestPlan_).select(state_,sink,skip,limit,order,predicate);
  }

  @Override
  public long cost() {
    return bestPlan_.cost();
  }
}