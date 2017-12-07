/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.dao.index;

import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Binary;
import foam.mlang.predicate.False;
import foam.mlang.predicate.Gt;
import foam.mlang.predicate.Gte;
import foam.mlang.predicate.Lt;
import foam.mlang.predicate.Lte;
import foam.mlang.predicate.Predicate;
import foam.mlang.sink.Count;
import java.util.Arrays;

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

  protected Binary isExprMatch(Predicate predicate, Class model) {
    if ( predicate != null && prop_ != null && model != null ) {
      if ( predicate instanceof Binary &&
           model.equals(predicate.getClass()) &&
           ((Binary) predicate).getArg1().equals(prop_) ) {

        Binary b = new Binary() {};
        b.setArg2(((Binary) predicate).getArg2());
        return b;
      }
    }
    return null;
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
      return new CountPlan(((TreeNode) state).size);
    }

    if ( predicate != null && predicate instanceof False ) {
      return NotFoundPlan.instance();
    }

//    Binary expr = isExprMatch(predicate, In.class);
//    Binary expr = isExprMatch(predicate, Eq.class);
//
//    if ( expr != null ) {
//      Object key = expr.getArg2().f(expr);
//      Object result = this.get(key);
//      if ( result == null) {
//        return NotFoundPlan.instance();
//      }
//      Plan[] subPlans = { planSelect(result, sink, skip, limit, order, predicate) };
//      return new AltPlan(subPlans,this.prop);
//    }
    TreeNode subTree = ((TreeNode) state);

    Binary expr = isExprMatch(predicate, Gt.class);
    if ( expr != null ) subTree = subTree.gt(subTree, expr.getArg2().f(expr), prop_);

    expr = isExprMatch(predicate, Gte.class);
    if ( expr != null ) subTree = subTree.gte(subTree, expr.getArg2().f(expr), prop_);

    expr = isExprMatch(predicate, Lt.class);
    if ( expr != null ) subTree = subTree.lt(subTree, expr.getArg2().f(expr), prop_);

    expr = isExprMatch(predicate, Lte.class);
    if ( expr != null ) subTree = subTree.lte(subTree, expr.getArg2().f(expr), prop_);

    long cost = subTree.size;

//    return CustomPlan;

    return (SelectPlan) TreePlan.instance();
  }

  public long size(Object state) {
    return ((TreeNode) state).size;
  }

  public void onAdd(Sink sink) {
  }

}
