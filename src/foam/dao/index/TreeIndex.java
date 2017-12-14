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

  protected Binary isExprMatch(Predicate predicate, Class model) {
    if ( predicate != null && prop_ != null && model != null ) {
      if ( predicate instanceof Binary &&
          model.equals(predicate.getClass()) &&
          ((Binary) predicate).getArg1().toString().equals(prop_.toString()) ) {

        Binary b = new Binary() {};
        b.setArg2(((Binary) predicate).getArg2());
        return b;
      }
    }
    if ( predicate instanceof And ) {
      int length = ((And) predicate).getArgs().length;
      for(int i=0;i<length;i++){
        Predicate arg = ((And) predicate).getArgs()[i];
        if ( predicate instanceof Binary &&
            model.equals(predicate.getClass()) &&
            ((Binary) predicate).getArg1().toString().equals(prop_.toString()) ) {

          Binary b = new Binary() {};
          ((And) predicate).getArgs()[i]= new True();
          predicate = predicate.partialEval();
          if ( predicate instanceof True ) return null;
          b.setArg2(((Binary) predicate).getArg2());
          return b;
        }
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


    Binary expr;
    Object subTree = state;

    //expr = isExprMatch(predicate, In.class);
    //if ( expr != null && Math.log(((TreeNode)state).size)/Math.log(2) * ((In) predicate) < ((TreeNode) state).size )
    expr = isExprMatch(predicate, Eq.class);
    if ( expr != null) {
      subTree = ((TreeNode) state).get((TreeNode) state,expr.getArg2().f(expr), prop_);
      if ( subTree == null ) return new NotFoundPlan();
      SelectPlan subPlan = this.tail_.planSelect(subTree,sink,skip,limit,order,null);
      return new AltSelectPlan(subTree,subPlan);
    }
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
//    TreeNode subTree = ((TreeNode) state);
//
    expr = isExprMatch(predicate, Gt.class);
    if ( expr != null ) subTree = ((TreeNode)subTree).gt((TreeNode)subTree, expr.getArg2().f(expr), prop_);

    expr = isExprMatch(predicate, Gte.class);
    if ( expr != null ) subTree = ((TreeNode)subTree).gte((TreeNode)subTree, expr.getArg2().f(expr), prop_);

    expr = isExprMatch(predicate, Lt.class);
    if ( expr != null ) subTree = ((TreeNode)subTree).lt((TreeNode)subTree, expr.getArg2().f(expr), prop_);

    expr = isExprMatch(predicate, Lte.class);
    if ( expr != null ) subTree = ((TreeNode)subTree).lte((TreeNode)subTree, expr.getArg2().f(expr), prop_);

    long cost;
    if ( subTree == null ) {
      cost = 0;
    }
    else {
      cost = subTree instanceof TreeNode?((TreeNode)subTree).size : 1;
    }
    boolean sortRequired = false;
    boolean reverseSort = false;
    if ( order!=null ) {
      if ( order.getClass().toString().equals(prop_.toString()) ) {}
      else if ( order instanceof Desc ) {
        reverseSort = true;
      } else {
        sortRequired = true;
        if ( cost !=0 ) cost *= Math.log(cost) / Math.log(2);
      }
    }
    if ( !sortRequired ) {
      if ( skip != 0 ) cost -= skip;
      if ( limit != 0 ) cost = Math.min(cost, limit);
    }
    //return CustomPlan;
    ScanPlan selectPlan = new ScanPlan();
    selectPlan.setCost(cost);
    return new AltSelectPlan(subTree,selectPlan);
  }

  public long size(Object state) {
    return ((TreeNode) state).size;
  }

  public void onAdd(Sink sink) {
  }

}
