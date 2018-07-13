/**
 * @license Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.dao.index;

import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.dao.AbstractDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.*;
import foam.mlang.predicate.Binary;
import foam.mlang.sink.Count;
import foam.mlang.sink.GroupBy;
import java.util.Arrays;

public class TreeIndex
  extends AbstractIndex
{
  protected Index        tail_;
  protected PropertyInfo prop_;
  protected long         selectCount_;

  public TreeIndex(PropertyInfo prop) {
    this(prop, ValueIndex.instance());
  }

  public TreeIndex(PropertyInfo prop, Index tail) {
    prop_        = prop;
    selectCount_ = 0;
    tail_        = tail;
  }

  public Object bulkLoad(FObject[] a) {
    Arrays.sort(a);
    return TreeNode.getNullNode().bulkLoad(tail_, prop_, 0, a.length-1, a);
  }

  /**
   *This fuction help to smaller state by predicate efficiently
   * @param state: When we could deal with predicate efficiently by index, the return sata will smaller than origin state
   * @param predicate: If the state is kind of Binary state, when we deal with it it will become null. If it is kind of N-arry state, the part of their predicate will become True or null.
   * @return Return an Object[] which contains two elements, first one is update state and second one is update predicate.
   */
  protected Object[] simplifyPredicate(Object state, Predicate predicate) {
    if ( predicate != null && prop_ != null ) {
      if ( predicate instanceof Binary ) {
        Binary expr = (Binary) predicate;
        if ( predicate.getClass().equals(Eq.class) && expr.getArg1().toString().equals(prop_.toString()) ) {
          state = ( (TreeNode) state ).get((TreeNode) state, expr.getArg2().f(expr), prop_);
          return new Object[]{state, null};
        }

//        if ( predicate.getClass().equals(Neq.class) && expr.getArg1().toString().equals(prop_.toString()) ) {
//          state = ( (TreeNode) state ).neq((TreeNode) state, expr.getArg2().f(expr), prop_);
//          return new Object[]{state, null};
//        }

        if ( predicate.getClass().equals(Gt.class) && expr.getArg1().toString().equals(prop_.toString()) ) {
          state = ( (TreeNode) state ).gt((TreeNode) state, expr.getArg2().f(expr), prop_);
          return new Object[]{state, null};
        }

        if ( predicate.getClass().equals(Gte.class) && expr.getArg1().toString().equals(prop_.toString()) ) {
          state = ( (TreeNode) state ).gte((TreeNode) state, expr.getArg2().f(expr), prop_);
          return new Object[]{state, null};
        }

        if ( predicate.getClass().equals(Lt.class) && expr.getArg1().toString().equals(prop_.toString()) ) {
          state = ( (TreeNode) state ).lt((TreeNode) state, expr.getArg2().f(expr), prop_);
          return new Object[]{state, null};
        }

        if ( predicate.getClass().equals(Lte.class) && expr.getArg1().toString().equals(prop_.toString()) ) {
          state = ( (TreeNode) state ).lte((TreeNode) state, expr.getArg2().f(expr), prop_);
          return new Object[]{state, null};
        }
      } else if ( predicate instanceof And ) {
        int length = ((And) predicate).getArgs().length;
        for ( int i = 0; i < length; i++ ) {
          Predicate arg = ( (And) predicate ).getArgs()[i];
          if ( arg != null && state != null ) {
            // Each args deal with by 'simplifyPredicate()' function recursively.
            Object[] statePredicate = simplifyPredicate(state, arg);
            state = statePredicate[0];
            arg   = (Predicate) statePredicate[1];
          }
          if ( arg == null ) {
            ((And) predicate).getArgs()[i] = new True();
          }
        }
        // use partialEval to simplify predicate themselves.
        predicate = predicate.partialEval();
        if ( predicate instanceof True ) return new Object[]{state, null};
      }
    }

    return new Object[]{state, predicate};
  }

  public Object put(Object state, FObject value) {
    if ( state == null ) state = TreeNode.getNullNode();
    Object key;
    try {
      key = prop_.f(value);
    } catch ( ClassCastException exp ) {
      return state;
    }

    return ((TreeNode) state).putKeyValue((TreeNode)state,
      prop_, key, value, tail_);
  }

  public Object remove(Object state, FObject value) {
    return ((TreeNode) state).removeKeyValue((TreeNode) state, prop_, prop_.f(value), value, tail_);
  }

  public Object removeAll() {
    return TreeNode.getNullNode();
  }

  //TODO
  public FindPlan planFind(Object state, Object key) {
    return new TreeLookupFindPlan(prop_, (state != null ? ((TreeNode) state).size : 0) );
  }


  /**
   * This function retrun plan depend on index and sink.
   * @return return is a selectPlan
   */
  public SelectPlan planSelect(Object state, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    if ( ( predicate != null && predicate instanceof False ) || state == null ) {
      return NotFoundPlan.instance();
    }

    if ( state == null ) return NotFoundPlan.instance();

    Object[] statePredicate = simplifyPredicate(state, predicate);
    state     = statePredicate[0];
    predicate = (Predicate) statePredicate[1];

    // To see if there have some possible to do count or groubBy select efficiently
    if ( predicate == null && sink instanceof Count && state != null ) {
      return new CountPlan(( (TreeNode) state ).size);
    }

    // We return a groupByPlan only if no order, no limit, no skip, no predicate
    if ( predicate == null && sink instanceof GroupBy
        && ( (GroupBy) sink ).getArg1().toString().equals(prop_.toString())
        && order == null && skip == 0 && limit == AbstractDAO.MAX_SAFE_INTEGER )
      return new GroupByPlan(state, sink, predicate, prop_, tail_);

    return new ScanPlan(state, sink, skip, limit, order, predicate, prop_, tail_);
  }

  public long size(Object state) {
    return ((TreeNode) state).size;
  }

  public void onAdd(Sink sink) {
  }

}
