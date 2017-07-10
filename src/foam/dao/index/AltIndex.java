/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.dao.index;

import foam.core.FObject;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import java.util.ArrayList;

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

  private Object[] toArrayObject(Object state) {
    if ( state == null ) return new Object[delegates_.size()];

    return (Object[]) state;
  }

  public Object get(Object state, FObject obj) {
    Object[] s = toArrayObject(state);

    return this.delegates_.get(0).get(s[0], obj);
  }

  public Object put(Object state, FObject value) {
    Object[] s = toArrayObject(state);

    for ( int i = 0 ; i < delegates_.size() ; i++ )
      s[i] = delegates_.get(i).put(s[i], value);

    return s;
  }


  public Object remove(Object state, FObject value) {
    Object[] s = toArrayObject(state);

    for ( int i = 0 ; i < delegates_.size() ; i++ )
      s[i] = delegates_.get(i).remove(s[i], value);

    return s;
  }

  public Object removeAll() {
    Object[] s = toArrayObject(null);

    for ( int i = 0 ; i < delegates_.size() ; i++ )
      s[i] = delegates_.get(i).removeAll();

    return s;
  }

  public FindPlan planFind(Object state, Object key) {
    Object[] s = toArrayObject(state);
    Plan bestPlan = NoPlan.instance();

    for ( int i = 0 ; i < delegates_.size() ; i++ ) {
      Plan plan = delegates_.get(i).planFind(s[i], key);

      if ( plan.cost() < bestPlan.cost() ) {
        bestPlan = plan;
        if ( bestPlan.cost() <= GOOD_ENOUGH_PLAN_COST ) break;
      }
    }

    return (FindPlan) bestPlan;
  }

  public SelectPlan planSelect(Object state, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    Object[] s = toArrayObject(state);
    Plan     bestPlan = NoPlan.instance();

    for ( int i = 0 ; i < delegates_.size() ; i++ ) {
      Plan plan = delegates_.get(i).planSelect(s[i], sink, skip, limit, order, predicate);

      if ( plan.cost() < bestPlan.cost() ) {
        bestPlan = plan;
        if ( bestPlan.cost() <= GOOD_ENOUGH_PLAN_COST ) break;
      }
    }

    return (SelectPlan) bestPlan;
  }

  public long size(Object state) {
    Object[] s = toArrayObject(state);
    return s.length > 0 ? delegates_.get(0).size(s[0]) : 0;
  }

  public void onAdd(Sink sink) {
  }
}
