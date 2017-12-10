/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import foam.core.*;
import foam.dao.*;
import foam.mlang.*;
import foam.mlang.predicate.*;
import foam.mlang.order.*;

public abstract class AbstractDAO
  extends    ContextAwareSupport
  implements DAO
{
  public final static long MAX_SAFE_INTEGER = 9007199254740991l;

  protected ClassInfo    of_          = null;
  protected PropertyInfo primaryKey_  = null;

  public DAO where(Predicate predicate) {
    return new FilteredDAO(predicate, this);
  }

  public DAO orderBy(Comparator comparator) {
    return new OrderedDAO(comparator, this);
  }

  public DAO skip(long count) {
    return new SkipDAO(count, this);
  }

  public DAO limit(long count) {
    return new LimitedDAO(count, this);
  }

  public void pipe_(X x, foam.dao.Sink sink) {
    throw new UnsupportedOperationException();
  }

  protected Sink decorateListener_(Sink sink, Predicate predicate) {
    if ( predicate != null ) {
      sink = new PredicatedSink(predicate, sink);
    }

    return sink;
  }

  protected Sink decorateSink_(Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    if ( ( limit > 0 ) && ( limit < this.MAX_SAFE_INTEGER ) ) {
      sink = new LimitedSink(limit, 0, sink);
    }

    if ( ( skip > 0 ) && ( skip < this.MAX_SAFE_INTEGER ) ) {
      sink = new SkipSink(skip, 0, sink);
    }

    if ( order != null ) {
      sink = new OrderedSink(order, null, sink);
    }

    if ( predicate != null ) {
      sink = new PredicatedSink(predicate, sink);
    }

    return sink;
  }

  public ClassInfo getOf() {
    return of_;
  }

  public AbstractDAO setOf(ClassInfo of) {
    of_ = of;
    primaryKey_ = (PropertyInfo) of.getAxiomByName("id");
    return this;
  }

  public PropertyInfo getPrimaryKey() {
    return primaryKey_;
  }

  protected Object getPK(FObject obj) {
    return getPrimaryKey().get(obj);
  }

  protected class DAOListener implements foam.core.Detachable {
    protected Sink sink;
    protected java.util.Collection listeners;

    public DAOListener(Sink sink, java.util.Collection listeners) {
      this.sink = sink;
      this.listeners = listeners;
    }

    public void detach() {
      listeners.remove(this);
    }

    public void put(FObject obj) {
      try {
        sink.put(obj, this);
      } catch (java.lang.Exception e) {
        detach();
      }
    }

    public void remove(FObject obj) {
      try {
        sink.remove(obj, this);
      } catch (java.lang.Exception e) {
        detach();
      }
    }

    public void reset() {
      try {
        sink.reset(this);
      } catch (java.lang.Exception e) {
        detach();
      }
    }
  }

  protected java.util.List<DAOListener> listeners_ = new java.util.concurrent.CopyOnWriteArrayList<DAOListener>();

  public void listen(Sink sink, Predicate predicate) {
    this.listen_(this.getX(), sink, predicate);
  }

  public void listen_(X x, Sink sink, Predicate predicate) {
    sink = decorateListener_(sink, predicate);
    listeners_.add(new DAOListener(sink, listeners_));
  }

  protected void onPut(FObject obj) {
    java.util.Iterator<DAOListener> iter = listeners_.iterator();

    while ( iter.hasNext() ) {
      DAOListener s = iter.next();
      s.put(obj);
    }
  }

  protected void onRemove(FObject obj) {
    java.util.Iterator<DAOListener> iter = listeners_.iterator();

    while ( iter.hasNext() ) {
      DAOListener s = iter.next();
      s.remove(obj);
    }
  }

  protected void onReset() {
    java.util.Iterator<DAOListener> iter = listeners_.iterator();

    while ( iter.hasNext() ) {
      DAOListener s = iter.next();
      s.reset();
    }
  }

  public FObject put(FObject obj) {
    return this.put_(this.getX(), obj);
  }

  public FObject remove(FObject obj) {
    return this.remove_(this.getX(), obj);
  }

  public void removeAll() {
    this.removeAll_(this.getX(), 0, this.MAX_SAFE_INTEGER, null, null);
  }

  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    this.select_(x, new RemoveSink(this), skip, limit, order, predicate);
  }

  protected Sink prepareSink(Sink s) {
    return s == null ? new ListSink() : s;
  }

  public Sink select() {
    return select(null);
  }

  public Sink select(Sink sink) {
    sink = prepareSink(sink);
    return this.select_(this.getX(), sink, 0, this.MAX_SAFE_INTEGER, null, null);
  }

  public FObject find(Object id) {
    return this.find_(this.getX(), id);
  }

  public void pipe(Sink sink) {
    this.pipe_(this.getX(), sink);
  }

  public DAO inX(X x) {
    ProxyDAO dao = new ProxyDAO(this);
    dao.setX(x);
    return dao;
  }

  public Object cmd_(X x, Object obj) {
    // TODO
    return null;
  }

  public Object cmd(Object obj) {
    return this.cmd_(this.getX(), obj);
  }
}
