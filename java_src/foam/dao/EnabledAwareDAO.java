/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;
import foam.dao.*;
import foam.mlang.MLang.*;
import foam.mlang.predicate.Predicate;
import foam.mlang.order.Comparator;
import foam.dao.Sink;
import foam.nanos.auth.EnabledAware;

public class EnabledAwareDAO
  extends ProxyDAO
{
  private Predicate PREDICATE_ = EQ(this.EnabledAware.ENABLED, true);
  public Sink select(Sink s, Integer skip, Integer limit, Comparator order, Predicate predicate) {
    return super.select(s, skip, limit, order, PREDICATE_);
  }

  public void removeAll(Integer skip, Integer limit, Comparator order, Predicate predicate) {
    super.removeAll(skip, limit, order, PREDICATE_);
  }
}
