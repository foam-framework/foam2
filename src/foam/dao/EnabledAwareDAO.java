/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import foam.core.X;
import foam.mlang.predicate.Predicate;
import foam.mlang.order.Comparator;
import foam.dao.Sink;

public class EnabledAwareDAO
  extends ProxyDAO
{
  public static final Predicate PREDICATE = foam.mlang.MLang.EQ(EnabledAware.ENABLED, true);

  public Sink select_(X x, Sink s, long skip, long limit, Comparator order, Predicate predicate) {
    return super.select_(x, s, skip, limit, order, PREDICATE);
  }

  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    super.removeAll_(x, skip, limit, order, PREDICATE);
  }
}
