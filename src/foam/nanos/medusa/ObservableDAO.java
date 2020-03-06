/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.medusa;

import foam.dao.AbstractDAO;
import foam.core.ClassInfo;
import foam.core.FObject;
import foam.core.X;
import foam.dao.Sink;
import foam.mlang.predicate.Predicate;
import foam.mlang.order.Comparator;

public class ObservableDAO extends AbstractDAO {

  public ObservableDAO(ClassInfo of) {
    setOf(of);
  }

  public FObject put_(X x, FObject obj) {
    onPut(obj);
    return obj;
  }

  public FObject find_(X x, Object o) {
    throw new RuntimeException("Do not support.");
  }

  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    throw new RuntimeException("Do not support.");
  }

  public FObject remove_(X x, FObject obj) {
    onRemove(obj);
    return obj;
  }

  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    throw new RuntimeException("Do not support.");
  }
}
