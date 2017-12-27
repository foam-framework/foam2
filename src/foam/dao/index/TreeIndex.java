/**
 * @license Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.dao.index;

import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Binary;
import foam.mlang.predicate.*;
import foam.mlang.sink.Count;
import java.util.Arrays;
import foam.mlang.order.Desc;

public class TreeIndex implements Index {
  protected Index tail_;
  protected PropertyInfo prop_;
  protected long selectCount_;

  public TreeIndex(PropertyInfo prop) {
    this(prop, ValueIndex.instance());
  }

  public TreeIndex(PropertyInfo prop, Index tail) {
    prop_ = prop;
    selectCount_ = 0;
    tail_ = tail;
  }

  public Object bulkLoad(FObject[] a) {
    Arrays.sort(a);
    return TreeNode.getNullNode().bulkLoad(tail_, prop_, 0, a.length-1, a);
  }

  protected Predicate simplifyPredicatePrepare(Predicate predicate) {
    if ( predicate instanceof And ) {
      int length = ( (And) predicate ).getArgs().length;
      for ( int i = 0; i < length; i++ ) {
        Predicate arg = ( (And) predicate ).getArgs()[i];
        ( (And) predicate ).getArgs()[i] = simplifyPredicatePrepare(arg);
      }
      return predicate.partialEval();
    }
    if ( predicate instanceof Not ) {
      if ( ( (Not) predicate ).getArg1() instanceof And )
        return predicate;
      predicate = predicate.partialEval();
      predicate = simplifyPredicatePrepare(predicate);
    }
    return predicate;
  }

  protected Object[] simplifyPredicate(Object state, Predicate predicate) {
    if ( predicate != null && prop_ != null ) {
      if ( predicate instanceof Binary ) {
        Binary expr = (Binary) predicate;
        if ( predicate.getClass().equals(Eq.class) && expr.getArg1().toString().equals(prop_.toString()) ) {
          state = ( (TreeNode) state ).get((TreeNode) state, expr.getArg2().f(expr), prop_);
          return new Object[]{state, null};
        }
        if ( predicate.getClass().equals(Neq.class) && expr.getArg1().toString().equals(prop_.toString()) ) {
          state = ( (TreeNode) state ).neq((TreeNode) state, expr.getArg2().f(expr), prop_);
          return new Object[]{state, null};
        }
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
        int length = ( (And) predicate ).getArgs().length;
        for ( int i = 0; i < length; i++ ) {
          Predicate arg = ( (And) predicate ).getArgs()[i];
          Object[] statePredicate = simplifyPredicate(state, arg);
          state = statePredicate[0];
          arg = (Predicate) statePredicate[1];
          if ( arg == null ) {
            ( (And) predicate ).getArgs()[i] = new True();
          }
        }
        predicate = predicate.partialEval();
        if ( predicate instanceof True ) return new Object[]{state, null};
      }
    }
    return new Object[]{state, predicate};
  }

  public Object put(Object state, FObject value) {
    if ( state == null ) {
      state = TreeNode.getNullNode();
    }
    return ((TreeNode) state).putKeyValue((TreeNode)state,
      prop_, prop_.f(value), value, tail_);
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


  //TODO
  public SelectPlan planSelect(Object state, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    if ( predicate == null && sink instanceof Count ) {
      return new CountPlan(( (TreeNode) state ).size);
    }
    if ( ( predicate != null && predicate instanceof False ) || state == null ) {
      return NotFoundPlan.instance();
    }
    if ( state == null ) return NotFoundPlan.instance();
    predicate = simplifyPredicatePrepare(predicate);
    Object[] statePredicate = simplifyPredicate(state, predicate);
    state = statePredicate[0];
    predicate = (Predicate) statePredicate[1];
    return new ScanPlan(state, sink, skip, limit, order, predicate, prop_, tail_);
  }

  public long size(Object state) {
    return ((TreeNode) state).size;
  }

  public void onAdd(Sink sink) {
  }

}
