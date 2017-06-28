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
  protected ClassInfo            of_   = null;

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

  public ClassInfo getOf() {
    return of_;
  }

  public MapDAO setOf(ClassInfo of) {
    of_ = of;
    primaryKey_ = (PropertyInfo) of.getAxiomByName("id");
    return this;
  }

  public FObject put_(X x, FObject obj) {
    getData().put(getPrimaryKey().get(obj), obj);
    return obj;
  }

  public FObject remove_(X x, FObject obj) {
    getData().remove(getPrimaryKey().get(obj));
    return obj;
  }

  public FObject find_(X x, Object o) {
    return AbstractFObject.maybeClone(
            getOf().isInstance(o)
            ? getData().get(getPrimaryKey().get(o))
            : getData().get(o)
    );
  }

  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    if ( sink == null ) sink = new ListSink();

    Sink         decorated = decorateSink_(sink, skip, limit, order, predicate);
    Subscription sub       = new Subscription();

    for ( FObject obj : getData().values() ) {
      if ( sub.getDetached() ) break;

      decorated.put(obj, sub);
    }

    decorated.eof();

    return sink;
  }

  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    setData(null);
  }

  public void pipe_(X x, Sink s) {
    // TODO
  }
}
