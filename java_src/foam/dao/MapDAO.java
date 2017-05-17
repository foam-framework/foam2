package foam.dao;

import foam.core.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;

public class MapDAO
  extends AbstractDAO
{
  private Map<Object, FObject> data_ = null;
  private ClassInfo            of_ = null;

  private synchronized void data_factory() {
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
    if(obj == null) System.out.println("wutface1");
    getData().put(getPrimaryKey().get(obj), obj);
    System.out.println("Putting with key:" + getPrimaryKey().get(obj));

    if(getPrimaryKey().get(obj).equals(getPrimaryKey().get(obj))) System.out.println("this should work");
    return obj;
  }

  public FObject remove(FObject obj) {
    getData().remove(getPrimaryKey().get(obj));
    return obj;
  }

  public FObject find(Object o) {
    //Object id = this.getOf().getClass().isInstance(o) ? getPrimaryKey().get(o) : o;
    Object key = getPrimaryKey().get(o);
    FObject result = getData().get(key);
    System.out.println("Getting with key:" + key);
    if(result == null) System.out.println("null though");
    return result;
  }

  public Sink select(Sink sink, Integer skip, Integer limit, Comparator order, Predicate predicate) {
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
