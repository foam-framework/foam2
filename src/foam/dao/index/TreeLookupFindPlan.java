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
   * The cost will claculate by the node size
   */
  public long cost() {
    return ((Double) Math.log(Long.valueOf(size_).doubleValue())).longValue();
  }

  public FObject find(Object state, Object key) {
    if ( state != null && state instanceof TreeNode ) {
      // Sometimes the object is not exist, it will return a null value.
      return ( (TreeNode) state ).get(( (TreeNode) state ), key, prop_) == null ? null : (FObject) ( (TreeNode) state ).get(( (TreeNode) state ), key, prop_).value;
    }

    return null;
  }

}
