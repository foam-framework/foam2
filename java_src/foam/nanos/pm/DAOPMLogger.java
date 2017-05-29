/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.pm;

import foam.dao.MapDAO;
import foam.dao.ProxyDAO;
import foam.nanos.NanoService;

public class DAOPMLogger
  extends    ProxyDAO
  implements PMLogger, NanoService
{

  public static final String ServiceName = "pmLogger";

  @Override
  public void log(PM pm) {
    PMInfo pmi = new PMInfo()
            .setClsname(pm.getClassType().getName())
            .setPmname(pm.getName());

    PMInfo dpmi = (PMInfo) getDelegate().find(pmi);
    if ( dpmi == null ) {
      pmi.setMintime(pm.getTime())
              .setMaxtime(pm.getTime())
              .setTotaltime(pm.getTime())
              .setNumoccurrences(1);

      getDelegate().put(pmi);
    } else {
      if ( pm.getTime() < dpmi.getMintime() )
        dpmi.setMintime(pm.getTime());

      if ( pm.getTime() > dpmi.getMaxtime() )
        dpmi.setMaxtime(pm.getTime());

      dpmi.setNumoccurrences(dpmi.getNumoccurrences() + 1);
      dpmi.setTotaltime(dpmi.getTotaltime() + pm.getTime());
      getDelegate().put(dpmi);
    }
  }

  @Override
  public void start() {
    MapDAO dao = new MapDAO();
    dao.setOf(PMInfo.getOwnClassInfo());
    dao.setX(getX());
    setDelegate(dao);
  }
}
