/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.dao.index;

import foam.core.FObject;
import foam.dao.AbstractSink;
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
      addIndex(null, indices[i]);
  }

  public Object addIndex(Object state, Index i) {
    delegates_.add(i);

    // No data to copy when just adding first index
    if ( delegates_.size() == 1 ) return state;

    // No state means no data to copy
    if ( state == null ) return state;

    // Copy all data from first index into new index, updating state
    final Object[] sa = toObjectArray(state);
    Sink sink = new AbstractSink() {
      public void put(Object obj, foam.core.Detachable sub) {
        sa[sa.length-1] = i.put(sa[sa.length-1], (FObject) obj);
      }
    };

    delegates_.get(0).planSelect(sa[0], sink, 0, Long.MAX_VALUE, null, null).select(sa[0], sink, 0, Long.MAX_VALUE, null, null);

    return sa;
  }

  protected Object[] toObjectArray(Object state) {
    Object[] s2 = new Object[delegates_.size()];

    if ( state != null ) {
      Object[] s1 = (Object[]) state;

      for ( int i = 0 ; i < s1.length ; i++ ) {
        s2[i] = s1[i];
      }
    }

    return s2;
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
    if ( state == null ) return NotFoundPlan.instance();

    Object[] s         = (Object[]) state;
    FindPlan bestPlan  = NoPlan.instance();
    Object   bestState = null;

    for ( int i = 0 ; i < delegates_.size() ; i++ ) {
      FindPlan plan = delegates_.get(i).planFind(s[i], key);

      // only return the smallest cost plan
      if ( plan.cost() < bestPlan.cost() ) {
        bestPlan  = plan;
        bestState = s[i];
        if ( bestPlan.cost() <= GOOD_ENOUGH_PLAN_COST ) break;
      }
    }

    return new AltFindPlan(bestState, bestPlan);
  }

  public SelectPlan planSelect(Object state, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    if ( state == null ) return NotFoundPlan.instance();

    Object[]   s                 = (Object[]) state;
    SelectPlan bestPlan          = NoPlan.instance();
    Object     bestState         = null;
    Predicate  originalPredicate = null;

    for ( int i = 0 ; i < delegates_.size() ; i++ ) {
      // ???: Why is this?
      // To keep the original predicate, because in our next operate the predicate will be changed
      if ( predicate != null ) {
        originalPredicate = (Predicate) ((FObject) predicate).deepClone();
      }

      SelectPlan plan = delegates_.get(i).planSelect(s[i], sink, skip, limit, order, originalPredicate);

      if ( plan.cost() < bestPlan.cost() ) {
        bestPlan  = plan;
        bestState = s[i];
        if ( bestPlan.cost() <= GOOD_ENOUGH_PLAN_COST ) break;
      }
    }

    return new AltSelectPlan(bestState, bestPlan);
  }

  public long size(Object state) {
    if ( state == null ) return 0;
    Object[] s = (Object[]) state;
    return s.length > 0 ? delegates_.get(0).size(s[0]) : 0;
  }
}
