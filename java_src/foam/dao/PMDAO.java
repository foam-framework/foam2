package foam.dao;

import foam.core.FObject;
import foam.nanos.pm.PM;
import foam.nanos.pm.PMInfo;

/**
 * Created by nick on 19/05/17.
 */
public class PMDAO extends ProxyDAO {

  @Override
  public FObject put(FObject obj) {
    if(obj instanceof PMInfo) {
      PMInfo pmi = (PMInfo)obj;
      PM pm = new PM(PMDAO.class, pmi.getClsname() + ":" + pmi.getPmname());
      getDelegate().put(pmi);
      pm.end(getX());
    }
    return obj;
  }

}
