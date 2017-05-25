package foam.dao;

import foam.core.FObject;
import foam.nanos.pm.PM;

/**
 * Created by nick on 19/05/17.
 */
public class PMDAO extends ProxyDAO {

  @Override
  public FObject put(FObject obj) {
    PM pm = new PM(PMDAO.class, obj.getClassInfo().getId());
    try {
      getDelegate().put(obj);
    } catch(Exception e) {
      e.printStackTrace();
    } finally {
      pm.log(getX());
    }
    return obj;
  }
}
