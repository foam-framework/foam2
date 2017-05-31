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
  protected ClassInfo    of_         = null;
  protected PropertyInfo primaryKey_ = null;

  public DAO where(Predicate predicate) {
    return new FilteredDAO().setPredicate(predicate).setDelegate(this);
  }

  public DAO orderBy(Comparator comparator) {
    return new OrderedDAO().setOrder(comparator).setDelegate(this);
  }

  public DAO skip(int count) {
    return new SkipDAO().setSkip(count).setDelegate(this);
  }

  public DAO limit(int count) {
    return new LimitedDAO().setLimit(count).setDelegate(this);
  }

  public void pipe(foam.dao.Sink sink) {
    throw new UnsupportedOperationException();
  }

  protected Sink decorateSink_(Sink sink, Integer skip, Integer limit, Comparator order, Predicate predicate) {
    if ( limit != null ) {
      sink = new LimitedSink().setLimit(limit.intValue()).setDelegate(sink);
    }

    if ( skip != null ) {
      sink = new SkipSink().setSkip(skip.intValue()).setDelegate(sink);
    }

    if ( order != null ) {
      sink = new OrderedSink().setComparator(order).setDelegate(sink);
    }

    if ( predicate != null ) {
      sink = new PredicatedSink().setPredicate(predicate).setDelegate(sink);
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
    // TODO
  }

  public Sink select(Sink sink) {
    return this.select(sink, 0, Integer.MAX_VALUE, null, null);
  }
}
