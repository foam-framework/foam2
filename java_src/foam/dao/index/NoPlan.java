/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.dao.index;

import foam.core.FObject;
import foam.dao.Sink;
import foam.mlang.predicate.Predicate;
import java.util.Comparator;

/** Have-no-plan Plan. **/
public class NoPlan implements FindPlan, SelectPlan
{
  protected final static NoPlan instance_ = new NoPlan();

  public static NoPlan instance() { return instance_; }

  protected NoPlan() {}

  public long cost() { return Long.MAX_VALUE; }

  public FObject find(Object state, Object key) {
    throw new IllegalStateException("Attempt to use NoPlan.");
  }

  public void select(Object state, Sink sink, int skip, int limit, Comparator order, Predicate predicate) {
    throw new IllegalStateException("Attempt to use NoPlan.");
  }
}
