/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import foam.core.*;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class MapDAO
  extends AbstractDAO
{
  protected Map<Object, FObject> data_ = null;

  public MapDAO() {
  }

  public MapDAO(ClassInfo of) {
    setOf(of);
  }

  public MapDAO(X x, ClassInfo of) {
    setX(x);
    setOf(of);
  }

  protected synchronized void data_factory() {
    if ( data_ == null ) {
      data_ = (Map<Object, FObject>) new ConcurrentHashMap();
    }
  }

  protected Map<Object, FObject> getData() {
    if ( data_ == null ) {
      data_factory();
    }
    return data_;
  }

  public void setData(Map<Object, FObject> data) {
    data_ = data;
  }

  public FObject put_(X x, FObject obj) {
    Object key = getPrimaryKey().get(obj);
    if ( key == null ) {
      throw new RuntimeException("Missing Primary Key in " + this.getOf().getId() + ".put()");
    }
    getData().put(key, obj);
    onPut(obj.fclone());
    return obj;
  }

  public FObject remove_(X x, FObject obj) {
    FObject existing = find_(x, obj);
    if ( existing != null ) {
      getData().remove(getPrimaryKey().get(obj));
      onRemove(existing);
    }

    return obj;
  }

  public FObject find_(X x, Object o) {
    if ( o == null ) {
      System.err.println("Attempt to " + this.getOf().getId() + ".find(null).");
    }
    return AbstractFObject.maybeClone(
        getOf().isInstance(o)
          ? getData().get(getPrimaryKey().get(o))
          : getData().get(o)
    );
  }

  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    sink = prepareSink(sink);

    Sink         decorated = decorateSink_(sink, skip, limit, order, predicate);
    Subscription sub       = new Subscription();

    for ( FObject obj : getData().values() ) {
      if ( sub.getDetached() ) break;

      decorated.put(obj, sub);
    }

    decorated.eof();

    return sink;
  }

  public void pipe_(X x, Sink s) {
    // TODO
  }
}
