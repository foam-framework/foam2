/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.dao.index;

import foam.dao.Sink;
import foam.mlang.predicate.Predicate;
import java.util.Comparator;

public interface SelectPlan extends Plan {
  public void select(Object state, Sink sink, int skip, int limit, Comparator order, Predicate predicate);
}