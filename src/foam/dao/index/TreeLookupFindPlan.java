/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.dao.index;

import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.dao.index.TreeNode;

public class TreeLookupFindPlan implements FindPlan {

  protected PropertyInfo prop_;
  protected long size_;

  public TreeLookupFindPlan(PropertyInfo prop, long size) {
    prop_ = prop;
    size_ = size;
  }

  /**
   * The cost is calculated based on the size of the tree.
   */
  public long cost() {
    return ((Double) Math.log(Long.valueOf(size_).doubleValue())).longValue();
  }

  public FObject find(Object state, Object key) {
    if ( state instanceof TreeNode ) {
      TreeNode stateNode = (TreeNode) state;
      TreeNode valueNode = stateNode.get(stateNode, key, prop_);

      // If the object being searched for isn't in the tree, then valueNode will
      // be null.
      return valueNode == null ? null : (FObject) valueNode.value;
    }

    return null;
  }

  @Override
  public String toString() {
    return "tree-lookup(size:" + size_ + ", cost:" + cost() + ", prop:" + prop_.toString() + ")";
  }
}
