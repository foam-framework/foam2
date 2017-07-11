package foam.dao;

import foam.core.Detachable;
import foam.core.FObject;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;

public class RemoveSink {

  public RemoveSink(final DAO dao) {
    dao.select_(((AbstractDAO) dao).getX(), new AbstractSink() {
      @Override
      public void put(FObject obj, Detachable sub) {
        dao.remove(obj);
      }
    }, 0, AbstractDAO.MAX_SAFE_INTEGER,null, null);
  }

  public RemoveSink(final DAO dao, long skip, long limit, Comparator order, Predicate predicate) {
    dao.select_(((AbstractDAO) dao).getX(), new AbstractSink() {
      @Override
      public void put(FObject obj, Detachable sub) {
        dao.remove(obj);
      }
    }, skip, limit, order, predicate);
  }
}
