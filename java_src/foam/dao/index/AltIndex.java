/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.dao.index;

import foam.core.FObject;
import foam.dao.Sink;
import foam.mlang.predicate.Predicate;
import java.util.ArrayList;
import java.util.Comparator;

/** Note this class is not thread safe because ArrayList isn't thread-safe. Needs to be made safe by containment. **/
public class AltIndex implements Index {

  public final static int GOOD_ENOUGH_PLAN_COST = 10;

  protected ArrayList<Index> delegates_ = new ArrayList();

  public AltIndex(Index... indices) {
    for ( int i = 0 ; i < indices.length ; i++ )
      addIndex(indices[i]);
  }

  public void addIndex(Index i) {
    delegates_.add(i);
  }

  public Object put(Object state, FObject value) {
    Object[] newState = new Object[((Object[])state).length];

    for ( int i = 0 ; i < delegates_.size() ; i++ )
      newState[i] = delegates_.get(i).put(state, value);

    return newState;
  }

  public Object remove(Object state, FObject value) {
    Object[] newState = new Object[((Object[])state).length];

    for ( int i = 0 ; i < delegates_.size() ; i++ )
      newState[i] = delegates_.get(i).remove(state, value);

    return newState;
  }

  public Object removeAll() {
    Object[] newState = new Object[delegates_.size()];

    for ( int i = 0 ; i < delegates_.size() ; i++ )
      newState[i] = delegates_.get(i).removeAll();

    return newState;
  }

  public FindPlan planFind(Object state, Object key) {
    Object[] states   = (Object[]) state;
    Plan     bestPlan = NoPlan.instance();

    for ( int i = 0 ; i < delegates_.size() ; i++ ) {
      Plan plan = delegates_.get(i).planFind(states[i], key);

      if ( plan.cost() < bestPlan.cost() ) {
        bestPlan = plan;
        if ( bestPlan.cost() <= GOOD_ENOUGH_PLAN_COST ) break;
      }
    }

    return (FindPlan) bestPlan;
  }

  public SelectPlan planSelect(Object state, Sink sink, int skip, int limit, Comparator order, Predicate predicate) {
    Object[] states   = (Object[]) state;
    Plan     bestPlan = NoPlan.instance();

    for ( int i = 0 ; i < delegates_.size() ; i++ ) {
      Plan plan = delegates_.get(i).planSelect(states[i], sink, skip, limit, order, predicate);

      if ( plan.cost() < bestPlan.cost() ) {
        bestPlan = plan;
        if ( bestPlan.cost() <= GOOD_ENOUGH_PLAN_COST ) break;
      }
    }

    return (SelectPlan)bestPlan;
  }

  public long size(Object state) {
    return delegates_.get(0).size(state);
  }

  @Override
  public void onAdd(Sink sink) {
  }
}
