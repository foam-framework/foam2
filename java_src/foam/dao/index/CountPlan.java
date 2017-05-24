/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.dao.index;

import foam.dao.Sink;
import foam.mlang.predicate.Predicate;
import foam.mlang.sink.Count;
import java.util.Comparator;

public class CountPlan implements SelectPlan
{
  protected long count_;

  public CountPlan(long count) { count_ = count; }

  public long cost() { return 0; }

  public void select(Object state, Sink sink, int skip, int limit, Comparator order, Predicate predicate) {
    ((Count) sink).setValue(count_);
  }

  public String toString() { return "short-circuit-count(" + count_ + ")"; }
}