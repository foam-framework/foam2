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

/** Found that no data exists for the query. **/
public class NotFoundPlan implements FindPlan, SelectPlan
{
  protected final static NotFoundPlan instance_ = new NotFoundPlan();

  public static NotFoundPlan instance() { return instance_; }

  protected NotFoundPlan() {}

  public long cost() { return 0; }

  public FObject find(Object state, Object key) {
    return null;
  }

  public void select(Object state, Sink sink, int skip, int limit, Comparator order, Predicate predicate) {
  }
}