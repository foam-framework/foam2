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
  protected long cost_;
  protected Index tail_;
  protected boolean reverseSort_ = false;
  protected boolean needGroupBy = true;

  public GroupByPlan(Object state, Sink sink, Predicate predicate, PropertyInfo propertyInfo, Index tail) {
    state_ = state;
    cost_ = calculateCost(propertyInfo);
    tail_ = tail;
  }

  public long calculateCost(PropertyInfo propertyInfo) {
    long cost;
    if ( state_ == null ) return 0;
    cost = ( (TreeNode) state_ ).size;
    return cost - 1;
  }

  public long cost() {
    return cost_;
  }

  public void select(Object state, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    if ( state_ == null )
      return;
    ( (TreeNode) state ).groupBy((TreeNode) state_, sink, tail_);
  }

  @Override
  public String toString() {
    var size = state_ == null ? 0
                : state_ instanceof TreeNode ? ((TreeNode) state_).size : 1;
    return "group-by(size:" + size + ", cost:" + cost() + ")";
  }
}
