/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.dao.index;

import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.dao.Sink;
import foam.mlang.predicate.And;
import foam.mlang.predicate.Binary;
import foam.mlang.predicate.Eq;
import foam.mlang.predicate.False;
import foam.mlang.predicate.Gt;
import foam.mlang.predicate.Gte;
import foam.mlang.predicate.Lt;
import foam.mlang.predicate.Lte;
import foam.mlang.predicate.Predicate;
import foam.mlang.sink.Count;
import java.util.Comparator;

public class TreeIndex implements Index {
  protected Index tail;
  protected PropertyInfo prop;
  protected long selectCount;
  protected TreeNode tree;
  
  public TreeIndex(PropertyInfo prop) {
    this.prop = prop;
    this.selectCount = 0;
    this.tail = ValueIndex.instance();
    this.tree = TreeNode.getNullNode();
  }
  
  public TreeIndex(PropertyInfo prop, Index tail) {
    this.prop = prop;
    this.selectCount = 0;
    this.tail = tail;
  }
  
  public void bulkLoad(FObject... a) {
    if ( this.tail instanceof ValueIndex ) {
      this.tree = (TreeNode)this.tree.bulkLoad(this.prop, 0, a.length-1, a);
    }
    for ( int i = 0 ; i < a.length ; i++ ) {
      this.tree = (TreeNode) this.put(this.tree, a[i]);
    }
  }
  // predicate from plan, prop from index itself, Mlang Expression
  protected Binary isExprMatch(Predicate predicate, Predicate model) {
    Predicate foc = new Eq();
    
    if ( predicate != null && this.prop != null && model != null ) {
      if ( predicate instanceof Binary && model instanceof Binary &&
           ((Binary)model).getClassInfo().equals(((Binary)predicate).getClassInfo()) && 
           ((Binary)predicate).getArg1().equals(this.prop) ) {
        
        Binary b = new Binary() {};
        b.setArg2(((Binary)predicate).getArg2());
        return b;
      }
      if ( predicate instanceof And && ((And)model).getArgs() != null ) {
        for ( Predicate p : ((And)model).getArgs() ) {
          if ( p instanceof Binary && model instanceof Binary &&
              ((Binary)model).getClassInfo().equals(((Binary)p).getClassInfo()) && 
              ((Binary)p).getArg1().equals(this.prop) ) {
        
            Binary b = new Binary() {};
            b.setArg2(((Binary)p).getArg2());
            return b;
          }
        }
      }
    }
    return null;
  }
  public Object get(Object key) {
    return this.tree.get(this.tree, key, this.prop);
  }
  
  public Object put(Object state, FObject value) {
    this.tree = this.tree.putKeyValue((TreeNode)state, this.prop, this.prop.f(value), value);
    return this.tree;
  }
  
  public Object remove(Object state, FObject value) {
    this.tree = this.tree.removeKeyValue((TreeNode)state, this.prop, this.prop.f(value), value);
    return this.tree;
  }

  public Object removeAll() {
    this.tree = TreeNode.getNullNode();
    return this.tree;
  }
  //TODO
  public FindPlan planFind(Object state, Object key) {
    return (FindPlan) ValuePlan.instance();
  }
  //TODO
  public SelectPlan planSelect(Object state, Sink sink, int skip, int limit, Comparator order, Predicate predicate) {
    
    if ( predicate == null && sink instanceof Count ) {
      return new CountPlan(this.tree.size);
    }
    
    if ( predicate != null && predicate instanceof False ) {
      return NotFoundPlan.instance();
    }
    
//    Binary expr = isExprMatch(predicate, In);
//    Binary expr = isExprMatch(predicate, new Eq());
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
    TreeNode subTree = this.tree;
    
    Binary expr = isExprMatch(predicate, new Gt());
    if ( expr != null ) subTree = subTree.gt(subTree, expr.getArg2().f(expr), prop);
    
    expr = isExprMatch(predicate, new Gte());
    if ( expr != null ) subTree = subTree.gte(subTree, expr.getArg2().f(expr), prop);
    
    expr = isExprMatch(predicate, new Lt());
    if ( expr != null ) subTree = subTree.lt(subTree, expr.getArg2().f(expr), prop);
    
    expr = isExprMatch(predicate, new Lte());
    if ( expr != null ) subTree = subTree.lte(subTree, expr.getArg2().f(expr), prop);
    
    long cost = subTree.size;
    
//    return CustomPlan;
    
    return (SelectPlan) ValuePlan.instance();
  }

  public long size(Object state) {
    return this.tree.size;
  }
  
  
  public void onAdd(Sink sink) {
  }

}
