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
public class AltIndex
  extends AbstractIndex
{

  public final static int GOOD_ENOUGH_PLAN_COST = 10;

  protected ArrayList<Index> delegates_ = new ArrayList();

  public AltIndex(Index... indices) {
    for ( int i = 0 ; i < indices.length ; i++ )
      addIndex(indices[i]);
  }

  public void addIndex(Index i) {
    delegates_.add(i);
  }

  protected Object[] toObjectArray(Object state) {
    if ( state == null ) return new Object[delegates_.size()];

    return (Object[]) state;
  }

  public Object put(Object state, FObject value) {
    Object[] s = toObjectArray(state);

    for ( int i = 0 ; i < delegates_.size() ; i++ )
      s[i] = delegates_.get(i).put(s[i], value);

    return s;
  }


  public Object remove(Object state, FObject value) {
    Object[] s = toObjectArray(state);

    for ( int i = 0 ; i < delegates_.size() ; i++ )
      s[i] = delegates_.get(i).remove(s[i], value);

    return s;
  }

  public Object removeAll() {
    Object[] s = toObjectArray(null);

    for ( int i = 0 ; i < delegates_.size() ; i++ )
      s[i] = delegates_.get(i).removeAll();

    return s;
  }


  public FindPlan planFind(Object state, Object key) {
    Object[] s         = toObjectArray(state);
    FindPlan bestPlan  = NoPlan.instance();
    Object   bestState = null;

    for ( int i = 0 ; i < delegates_.size() ; i++ ) {
      FindPlan plan = delegates_.get(i).planFind(s[i], key);

      // only return the smallest cost plan
      if ( plan.cost() < bestPlan.cost() ) {
        bestPlan = plan;
        bestState = s[i];
        if ( bestPlan.cost() <= GOOD_ENOUGH_PLAN_COST ) break;
      }
    }

    return new AltFindPlan(bestState, bestPlan);
  }

  public SelectPlan planSelect(Object state, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    Object[]     s                 = toObjectArray(state);
    SelectPlan   bestPlan          = NoPlan.instance();
    Object       bestState         = null;
    Predicate    originalPredicate = null;

    for ( int i = 0; i < delegates_.size(); i++ ) {
      // ???: Why is this?
      // To keep the original predicate, because in our next operate the predicate will be changed
      if ( predicate != null ) {
        originalPredicate = (Predicate) ((FObject) predicate).deepClone();
      }

      SelectPlan plan = delegates_.get(i).planSelect(s[i], sink, skip, limit, order, originalPredicate);
      bestState = s[i];

      if ( plan.cost() < bestPlan.cost() ) {
        bestPlan  = plan;
        bestState = s[i];
        if ( bestPlan.cost() <= GOOD_ENOUGH_PLAN_COST ) break;
      }
    }

    return new AltSelectPlan(bestState, bestPlan);
  }

  public long size(Object state) {
    Object[] s = toObjectArray(state);
    return s.length > 0 ? delegates_.get(0).size(s[0]) : 0;
  }

  public void onAdd(Sink sink) {
  }
}
