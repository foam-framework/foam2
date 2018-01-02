/**
 * @license Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.dao.index;

import foam.core.PropertyInfo;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.order.Desc;
import foam.mlang.predicate.Predicate;
import foam.mlang.sink.GroupBy;

public class GroupByPlan implements SelectPlan {

  protected Object state_;
  protected long skip_;
  protected long limit_;
  protected Comparator order_;
  protected long cost_;
  protected Index tail_;
  protected boolean reverseSort_ = false;
  protected boolean needGroupBy = true;

  public GroupByPlan(Object state, Sink sink, long skip, long limit, Comparator order, Predicate predicate, PropertyInfo propertyInfo, Index tail) {
    state_ = state;
    skip_ = skip;
    limit_ = limit;
    order_ = order;
    cost_ = calculateCost(propertyInfo);
    tail_ = tail;
    if ( sink instanceof GroupBy ) {
      if ( ( (GroupBy) sink ).getArg1().toString().equals(propertyInfo.toString()) ) {
        needGroupBy = false;
        cost_ = cost_ - 1;
      }
    }
  }

  public long calculateCost(PropertyInfo propertyInfo) {
    long cost;
    if ( state_ == null ) return 0;
    cost = ( (TreeNode) state_ ).size;
    boolean sortRequired = false;
    if ( order_ != null ) {
      if ( order_.toString().equals(propertyInfo.toString()) ) {
        order_ = null;
      } else if ( order_ instanceof Desc ) {
        if ( ( (Desc) order_ ).getArg1().toString().equals(propertyInfo.toString()) ) {
          reverseSort_ = true;
          order_ = null;
        }
      } else {
        sortRequired = true;
        cost *= Math.log(cost) / Math.log(2);
      }
    }
    if ( ! sortRequired ) {
      if ( skip_ != 0 ) cost = Math.max(cost - skip_, 0);
      if ( limit_ != 0 ) cost = Math.min(cost, limit_);
    }
    return cost;
  }

  public long cost() {
    return cost_;
  }

  public void select(Object state, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    if ( state_ == null )
      return;
    if ( needGroupBy || order_ != null || reverseSort_ ) {
      ( (TreeNode) state_ ).select((TreeNode) state_, sink, skip_, limit_, order_, null, tail_, reverseSort_);
    } else {
      ( (TreeNode) state ).groupBy((TreeNode) state_, sink, skip_, limit_, ( (TreeNode) state_ ).size, tail_);
    }
  }

}