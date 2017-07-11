package foam.dao;

import foam.core.Detachable;
import foam.core.FObject;

public class RemoveSink {

  public RemoveSink(final DAO dao) {
    dao.select_(((AbstractDAO) dao).getX(), new AbstractSink() {
      @Override
      public void put(FObject obj, Detachable sub) {
        dao.remove(obj);
      }
    }, 0, AbstractDAO.MAX_SAFE_INTEGER,null, null);
  }
}
