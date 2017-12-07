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


public class TreePlan implements FindPlan, SelectPlan {
  protected final static TreePlan instance_ = new TreePlan();

  public static TreePlan instance() { return instance_; }

  protected TreePlan() {}

  public long cost() { return 1; }

  public FObject find(Object state, Object key) {
    return null;
  }

  public void select(Object state, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    ((TreeNode)state).select((TreeNode)state, sink);
  }
}
