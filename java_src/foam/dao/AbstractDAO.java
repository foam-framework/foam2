package foam.dao;

import foam.core.*;
import foam.dao.*;
import foam.mlang.*;
import foam.mlang.predicate.*;
import foam.mlang.order.*;

public abstract class AbstractDAO extends ContextAwareSupport implements DAO {
  public DAO where(Predicate predicate) {
    return ((FilteredDAO)getX().create(FilteredDAO.class)).setPredicate(predicate).setDelegate(this);
  }

  public DAO orderBy(Comparator comparator) {
    return ((OrderedDAO)getX().create(OrderedDAO.class)).setOrder(comparator).setDelegate(this);
  }

  public DAO skip(int count) {
    return ((SkipDAO)getX().create(SkipDAO.class)).setSkip(count).setDelegate(this);
  }

  public DAO limit(int count) {
    return ((LimitedDAO)getX().create(LimitedDAO.class)).setLimit(count).setDelegate(this);
  }

  public void pipe(foam.dao.Sink sink) {
    throw new UnsupportedOperationException();
  }

  protected Sink decorateSink_(Sink sink, Integer skip, Integer limit, Comparator order, Predicate predicate) {
    if ( limit != null ) {
      sink = ((LimitedSink)getX().create(LimitedSink.class)).setLimit(limit.intValue()).setDelegate(sink);
    }

    if ( skip != null ) {
      sink = ((SkipSink)getX().create(SkipSink.class)).setSkip(skip.intValue()).setDelegate(sink);
    }

    if ( order != null ) {
      sink = ((OrderedSink)getX().create(OrderedSink.class)).setComparator(order).setDelegate(sink);
    }

    if ( predicate != null ) {
      sink = ((PredicatedSink)getX().create(PredicatedSink.class)).setPredicate(predicate).setDelegate(sink);
    }

    return sink;
  }


  private ClassInfo of_ = null;
  private PropertyInfo primaryKey_ = null;

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
}
