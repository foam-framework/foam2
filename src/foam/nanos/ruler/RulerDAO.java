package foam.nanos.ruler;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ProxyDAO;
import foam.dao.DAO;
import foam.nanos.boot.NSpec;

public class RulerDAO extends ProxyDAO {
  String daoKey;

  public RulerDAO(X x, DAO delegate, String serviceName) {
    setX(x);
    setDelegate(delegate);
    //setDaoKey(serviceName);
  }

  @Override
  public FObject put_(X x, FObject obj) {
return obj;
  }

}
