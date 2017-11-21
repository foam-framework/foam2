/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import foam.core.FObject;
import foam.core.X;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;

/**
 * A Null pattern (do-nothing) DAO implementation
 */
public class NullDAO
    extends AbstractDAO {

  @Override
  public FObject put_(X x, FObject obj) {
    onPut(obj);
    return obj;
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    onRemove(obj);
    return null;
  }

  @Override
  public FObject find_(X x, Object id) {
    return null;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    if ( sink == null ) {
      sink = new ArraySink();
    }
    sink.eof();
    return sink;
  }

  @Override
  public void removeAll_(foam.core.X x, long skip, long limit, Comparator order, Predicate predicate) {}
}