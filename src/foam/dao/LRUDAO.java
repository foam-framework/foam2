/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.dao;

import java.util.Map;
import foam.core.*;
import foam.util.ConcurrentLRU;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;

public class LRUDAO
  extends AbstractDAO
{
  private ConcurrentLRU<Object, FObject> lru_;

  public LRUDAO(X x, ClassInfo of, int max) {
    setX(x);
    setOf(of);
    lru_ = new ConcurrentLRU<Object, FObject>(max);
  }

  public FObject put_(X x, FObject obj) {
    Object key = getPrimaryKey().get(obj);
    if ( key == null ) {
      throw new RuntimeException("Missing Primary Key in " + this.getOf().getId() + ".put()");
    }
    lru_.cache(key, obj);
    onPut(obj.fclone());
    return obj;
  }

  public FObject remove_(X x, FObject obj) {
    return lru_.remove(getPrimaryKey().get(obj));
  }

  public FObject find_(X x, Object o) {
    if ( o == null ) {
      return null;
    }
    return AbstractFObject.maybeClone(
      getOf().isInstance(o)
      ? lru_.get(getPrimaryKey().get(o))
      : lru_.get(o)
    );
  }

  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    sink = prepareSink(sink);
    Sink         decorated = decorateSink_(sink, skip, limit, order, predicate);
    Subscription sub       = new Subscription();
    for( Map.Entry<Object, FObject> e : lru_.entrySet() ) {
      if ( sub.getDetached() ) break;
      decorated.put(e.getValue(), sub);
    }
    decorated.eof();
    return sink;
  }
}