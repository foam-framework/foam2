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
  protected Index tail;
  protected PropertyInfo prop;
  protected long selectCount;

  public TreeIndex(PropertyInfo prop) {
    this(prop, ValueIndex.instance());
  }

  public TreeIndex(PropertyInfo prop, Index tail) {
    this.prop = prop;
    this.selectCount = 0;
    this.tail = tail;
  }

  public Object bulkLoad(FObject[] a) {
    Arrays.sort(a);
    return TreeNode.getNullNode().bulkLoad(this.tail, this.prop, 0, a.length-1, a);
  }

  protected Binary isExprMatch(Predicate predicate, Class model) {
    if ( predicate != null && this.prop != null && model != null ) {
      if ( predicate instanceof Binary &&
           model.equals(predicate.getClass()) &&
           ((Binary) predicate).getArg1().equals(this.prop) ) {

        Binary b = new Binary() {};
        b.setArg2(((Binary) predicate).getArg2());
        return b;
      }
    }
    return null;
  }

  public Object get(Object state, FObject obj) {
    if ( state != null ) {
      return ((TreeNode) state).get(((TreeNode) state), obj, this.prop);
    }
    return null;
  }

  public Object put(Object state, FObject value) {
    if ( state == null ) {
      state = TreeNode.getNullNode();
    }
    return ((TreeNode) state).putKeyValue((TreeNode)state,
      this.prop, this.prop.f(value), value, this.tail);
  }

  public Object remove(Object state, FObject value) {
    return ((TreeNode) state).removeKeyValue((TreeNode) state, this.prop, this.prop.f(value), value, this.tail);
  }

  public Object removeAll() {
    return TreeNode.getNullNode();
  }

  //TODO
  public FindPlan planFind(Object state, Object key) {
    return (FindPlan) ValuePlan.instance();
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
    if ( expr != null ) subTree = subTree.gt(subTree, expr.getArg2().f(expr), prop);

    expr = isExprMatch(predicate, Gte.class);
    if ( expr != null ) subTree = subTree.gte(subTree, expr.getArg2().f(expr), prop);

    expr = isExprMatch(predicate, Lt.class);
    if ( expr != null ) subTree = subTree.lt(subTree, expr.getArg2().f(expr), prop);

    expr = isExprMatch(predicate, Lte.class);
    if ( expr != null ) subTree = subTree.lte(subTree, expr.getArg2().f(expr), prop);

    long cost = subTree.size;

//    return CustomPlan;

    return (SelectPlan) ValuePlan.instance();
  }

  public long size(Object state) {
    return ((TreeNode) state).size;
  }

  public void onAdd(Sink sink) {
  }

}
