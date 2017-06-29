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

  protected ClassInfo    of_                = null;
  protected PropertyInfo primaryKey_        = null;

  public DAO where(Predicate predicate) {
    FilteredDAO filteredDAO = new FilteredDAO().setPredicate(predicate);
    filteredDAO.setDelegate(this);
    return filteredDAO;
  }

  public DAO orderBy(Comparator comparator) {
    OrderedDAO orderedDAO = new OrderedDAO().setOrder(comparator);
    orderedDAO.setDelegate(this);
    return orderedDAO;
  }

  public DAO skip(long count) {
    SkipDAO skipDAO = new SkipDAO().setSkip(count);
    skipDAO.setDelegate(this);
    return skipDAO;
  }

  public DAO limit(long count) {
    LimitedDAO limitedDAO = new LimitedDAO().setLimit(count);
    limitedDAO.setDelegate(this);
    return limitedDAO;
  }

  public void pipe_(X x, foam.dao.Sink sink) {
    throw new UnsupportedOperationException();
  }

  protected Sink decorateSink_(Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    if ( limit < this.MAX_SAFE_INTEGER ) {
      LimitedSink limitedSink = new LimitedSink();
      limitedSink.setLimit(limit);
      limitedSink.setDelegate(sink);
      sink = limitedSink;
    }

    if ( skip > 0 ) {
      SkipSink skipSink = new SkipSink();
      skipSink.setSkip(skip);
      skipSink.setDelegate(sink);
      sink = skipSink;
    }

    if ( order != null ) {
      OrderedSink orderedSink = new OrderedSink();
      orderedSink.setComparator(order);
      orderedSink.setDelegate(sink);
      sink = orderedSink;
    }

    if ( predicate != null ) {
      PredicatedSink predicatedSink = new PredicatedSink();
      predicatedSink.setPredicate(predicate);
      predicatedSink.setDelegate(sink);
      sink = predicatedSink;
    }

    return sink;
  }

  public ClassInfo getOf() {
    return of_;
  }

  public AbstractDAO setOf(ClassInfo of) {
    of_ = of;
    primaryKey_ = (PropertyInfo)of.getAxiomByName("id");
    return this;
  }

  public PropertyInfo getPrimaryKey() {
    return primaryKey_;
  }

  protected Object getPK(FObject obj) {
    return getPrimaryKey().get(obj);
  }

  public void listen() {
    this.listen_(this.getX());
  }

  public void listen_(X x) {
    // TODO
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

  public Sink select(Sink sink) {
    return this.select_(this.getX(), sink, 0, this.MAX_SAFE_INTEGER, null, null);
  }

  public FObject find(Object id) {
    return this.find_(this.getX(), id);
  }

  public void pipe(Sink sink) {
    this.pipe_(this.getX(), sink);
  }

  public DAO inX(X x) {
    ProxyDAO dao = new ProxyDAO();
    dao.setDelegate(this);
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
