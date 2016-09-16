package foam.dao;

import foam.core.*;
import foam.dao.*;
import foam.mlang.*;
import foam.mlang.predicate.*;
import foam.mlang.order.*;

public abstract class AbstractDAO extends ContextAwareSupport implements DAO {
  public DAO where(Predicate predicate) {
    return ((FilteredDAO)getX().create(FilteredDAO.class)).setPredicate(predicate);
  }

  public DAO orderBy(Comparator comparator) {
    return ((OrderedDAO)getX().create(OrderedDAO.class)).setOrder(comparator);
  }

  public DAO skip(int count) {
    return ((SkipDAO)getX().create(SkipDAO.class)).setSkip(count);
  }

  public DAO limit(int count) {
    return ((LimitedDAO)getX().create(LimitedDAO.class)).setLimit(count);
  }

  public void pipe(foam.dao.Sink sink) {
    throw new UnsupportedOperationException();
  }

  protected Sink decorateSink_(Sink sink, Integer skip, Integer limit, Comparator order, Predicate predicate) {
    if ( limit != null ) {
      sink = ((LimitedSink)getX().create(LimitedSink.class)).setLimit(limit.intValue());
    }

    if ( skip != null ) {
      sink = ((SkipSink)getX().create(SkipSink.class)).setSkip(skip.intValue());
    }

    if ( order != null ) {
      sink = ((OrderedSink)getX().create(OrderedSink.class)).setComparator(order);
    }

    if ( predicate != null ) {
      sink = ((PredicatedSink)getX().create(PredicatedSink.class)).setPredicate(predicate);
    }

    return sink;
  }
}
