package foam.dao;

import java.util.Iterator;
import foam.core.*;
import foam.util.ConcurrentList;
import foam.util.List;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;

public class FixedSizeDAO
  extends AbstractDAO
{
  private List<FObject> list;
  public FixedSizeDAO(X x, ClassInfo classInfo, int maxSize) {
    this(x, classInfo, maxSize, false);
  }
  public FixedSizeDAO(X x, ClassInfo classInfo, int maxSize, boolean isAutoRemoveOldest) {
    setX(x);
    setOf(classInfo);
    list = new ConcurrentList<FObject>(maxSize, isAutoRemoveOldest);
  }

  public FObject put_(X x, FObject obj) {
    Object key = getPrimaryKey().get(obj);
    if ( key == null ) {
      throw new RuntimeException("Missing Primary Key in " + this.getOf().getId() + ".put()");
    }
    list.enQueue(obj);
    onPut(obj.fclone());
    return obj;
  }

  public FObject remove_(X x, FObject obj) {
    //TODO
    FObject ret = find_(x, obj);
    if ( ret == null ) return null;
    return list.remove(ret, 0);
  }

  public FObject find_(X x, Object o) {
    FObject ret = null;
    Iterator<FObject> i = list.iterator();
    while( i.hasNext() ) {
      FObject f = i.next();
      Object id = getPrimaryKey().get(f);
      if ( getOf().isInstance(o) ? id.equals(getPrimaryKey().get(o)) : id.equals(o) ) {
        ret = f;
        break;
      }
    }
    return AbstractFObject.maybeClone(ret);
  }

  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    sink = prepareSink(sink);
    Sink         decorated = decorateSink_(sink, skip, limit, order, predicate);
    Subscription sub       = new Subscription();
    Iterator<FObject> i = list.iterator();
    while( i.hasNext() ) {
      FObject f = i.next();
      if ( sub.getDetached() ) break;
      decorated.put(f, sub);
    }
    decorated.eof();
    return sink;
  }
}