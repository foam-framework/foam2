/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.dao.index;

import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;

public interface SelectPlan extends Plan {
  public void select(Object state, Sink sink, long skip, long limit, Comparator order, Predicate predicate);
}
