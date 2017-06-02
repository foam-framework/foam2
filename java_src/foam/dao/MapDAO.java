package foam.dao;

import foam.core.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;

public class MapDAO
  extends AbstractDAO
{
  protected Map<Object, FObject> data_ = null;
  protected ClassInfo            of_ = null;

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
    primaryKey_ = (PropertyInfo)of.getAxiomByName("id");
    return this;
  }

  public FObject put(FObject obj) {
    getData().put(getPrimaryKey().get(obj), obj);
    return obj;
  }

  public FObject remove(FObject obj) {
    getData().remove(getPrimaryKey().get(obj));
    return obj;
  }

  public FObject find(Object o) {
    if( getOf().getObjClass().isInstance(o) ) {
      return getData().get(getPrimaryKey().get(o));
    } else {
      return getData().get(o);
    }
  }

  public Sink select_(Sink sink, Integer skip, Integer limit, Comparator order, Predicate predicate) {
    if ( sink == null ) {
      sink = new ListSink();
    }

    Sink         decorated = decorateSink_(sink, skip, limit, order, predicate);
    Subscription sub       = getX().create(Subscription.class);

    for ( FObject obj : getData().values() ) {
      if ( sub.getDetached() ) break;

      decorated.put(obj, sub);
    }

    decorated.eof();

    return sink;
  }

  public void removeAll(Integer skip, Integer limit, Comparator order, Predicate predicate) {
    setData(null);
  }

  public void pipe(Sink s) {
    // TODO
  }
}
