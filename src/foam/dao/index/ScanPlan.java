/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.dao.index;

import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.order.Desc;
import foam.mlang.predicate.Predicate;

/**
 * ScanPlan will strore the state which already deal with some operate ex: GT, EQ, LT... The sate will smaller than the orign state, which will make
 * the search more faster.
 */
public class ScanPlan
  implements FindPlan, SelectPlan
{
  protected Object     state_;
  protected long       skip_;
  protected long       limit_;
  protected Comparator order_;
  protected Predicate  predicate_;
  protected long       cost_;
  protected Index      tail_;
  protected boolean    reverse_ = false;

  // TODO: add ThenBy support for 'order'
  public ScanPlan(Object state, Sink sink, long skip, long limit, Comparator order, Predicate predicate, PropertyInfo propertyInfo, Index tail) {
    state_     = state;
    skip_      = skip;
    limit_     = limit;
    order_     = order;
    predicate_ = predicate;
    cost_      = calculateCost(propertyInfo);
    tail_      = tail;
  }

  public long calculateCost(PropertyInfo propertyInfo) {
    long cost;

    if ( state_ == null ) return 0;

    cost = ((TreeNode) state_).size;
    boolean sortRequired = false;
    if ( order_ != null ) {
      // ???: Why do we do a toString() here?
      if ( order_.toString().equals(propertyInfo.toString()) ) {
        // If the index is same with the property we would like to order, the order could be set to null. Because the order is already correct in the tree set.
        order_ = null;
      } else if ( order_ instanceof Desc && ((Desc) order_).getArg1().toString().equals(propertyInfo.toString()) && predicate_ == null ) {
        reverse_ = true;
        order_   = null;
      } else {
        sortRequired = true;
        cost *= Math.log(cost) / Math.log(2);
      }
    }

    if ( ! sortRequired && skip_ != 0 ) cost = Math.max(cost - skip_, 0);

    return cost;
  }

  public long cost() { return cost_; }

  public FObject find(Object state, Object key) {
    return null;
  }

  @Override
  public void select(Object state, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    if ( state_ == null ) return;
    // Use the stale_, skip_, limit_, order_, predicate_... which we have already pre-processed.
    ((TreeNode) state).select((TreeNode) state_, sink, skip_, limit_, order_, predicate_, tail_, reverse_);
  }

  @Override
  public String toString() {
    var sortRequired = order_ != null;
    var size = state_ == null ? 0
                : state_ instanceof TreeNode ? ((TreeNode) state_).size : 1;
    return "scan(size:" + size + ", cost:" + cost() + ", sortRequired:" + sortRequired + ")";
  }
}
