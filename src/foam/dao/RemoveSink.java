package foam.dao;

import foam.core.Detachable;
import foam.core.FObject;
import foam.core.X;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;

public class RemoveSink extends AbstractSink {

  protected DAO dao;

  public RemoveSink(DAO dao) {
    this.dao = dao;
  }

  @Override
  public void put(FObject obj, Detachable sub) {
    dao.remove(obj);
  }
}
