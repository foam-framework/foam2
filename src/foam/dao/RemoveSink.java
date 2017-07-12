package foam.dao;

import foam.core.Detachable;
import foam.core.FObject;
import foam.core.X;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;

public class RemoveSink implements Sink {

  protected DAO dao;

  public RemoveSink(DAO dao) {
    dao = dao;
  }

  @Override
  public void put(FObject obj, Detachable sub) {
    final X x = ((AbstractDAO) dao).getX();
    dao.select_(x, new AbstractSink() {
      @Override
      public void put(FObject obj, Detachable sub) {
        dao.remove_(x, obj);
      }
    }, 0, AbstractDAO.MAX_SAFE_INTEGER,null, null);
  }

  @Override
  public void remove(FObject obj, Detachable sub) {

  }

  @Override
  public void eof() {

  }

  @Override
  public void reset(Detachable sub) {

  }
}
