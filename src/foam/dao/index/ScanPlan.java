/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.dao.index;

import foam.core.FObject;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;


public class ScanPlan implements FindPlan, SelectPlan {

  protected long cost_;
  public ScanPlan(){}

  public long cost() { return cost_; }

  public void setCost(long cost) { cost_ = cost;}

  public FObject find(Object state, Object key) {
    return null;
  }

  public void select(Object state, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    if(state == null)
      return;
    ((TreeNode)state).select((TreeNode)state, sink, skip, limit, order, predicate);
  }
}