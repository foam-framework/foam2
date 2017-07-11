package foam.dao;

import foam.core.Detachable;
import foam.core.FObject;
import foam.core.X;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;

public class RemoveSink {

  public RemoveSink(final DAO dao) {
    final X x = ((AbstractDAO) dao).getX();
    dao.select_(x, new AbstractSink() {
      @Override
      public void put(FObject obj, Detachable sub) {
        dao.remove_(x, obj);
      }
    }, 0, AbstractDAO.MAX_SAFE_INTEGER,null, null);
  }

  public RemoveSink(final DAO dao, long skip, long limit, Comparator order, Predicate predicate) {
    final X x = ((AbstractDAO) dao).getX();
    dao.select_(x, new AbstractSink() {
      @Override
      public void put(FObject obj, Detachable sub) {
        dao.remove_(x, obj);
      }
    }, skip, limit, order, predicate);
  }
}
