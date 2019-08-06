package foam.dao;

import foam.core.FObject;
import foam.core.X;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;

public abstract class ORBitalDAO extends foam.dao.AbstractDAO {

  /** To be implemented by the class that has a 'remote' method */
  public abstract Object executeCmd_(foam.core.X x, Object obj);

  @Override
  public Object cmd_(foam.core.X x, Object obj){
    return super.cmd_(this.getX(), obj);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    return null;
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    return null;
  }

  @Override
  public FObject find_(X x, Object id) {
    return null;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    return null;
  }

}
