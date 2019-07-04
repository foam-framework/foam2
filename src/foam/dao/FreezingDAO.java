/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import foam.core.Detachable;
import foam.core.FObject;
import foam.core.X;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;

/** Explicitly freezes objects on select and clones on find. Use in combination with such DAOs as MutableDAO**/
public class FreezingDAO
  extends ProxyDAO
{
  public FreezingDAO(X x, DAO delegate) {
    super(x, delegate);
  }

  @Override
  public FObject find_(X x, Object id) {
    FObject ret = getDelegate().find_(x, id);
    if ( ret != null )
      ret = ret.fclone();
    return ret;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    getDelegate().select(new AbstractSink() {
      @Override
      public void put(Object obj, Detachable sub) {
        obj = ((FObject)obj).fclone();
        ((FObject) obj).freeze();
        sink.put(obj, sub);
      }
    });
    return sink;
  }
}
