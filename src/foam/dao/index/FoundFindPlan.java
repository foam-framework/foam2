/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.dao.index;

import foam.core.FObject;

public class FoundFindPlan implements FindPlan {
  protected FObject obj_;

  public FoundFindPlan(FObject obj) { obj_ = obj; }

  public long cost() { return 0; }

  public FObject find(Object state, Object key) { return obj_; }

  public String toString() { return "found(" + obj_.getClassInfo().getId() + ")"; }
}
