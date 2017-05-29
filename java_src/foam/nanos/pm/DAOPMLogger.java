/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.pm;

import foam.core.ContextAwareSupport;
import foam.dao.DAO;
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
            .setPmname(pm.getName())
            .setMintime(pm.getTime())
            .setMaxtime(pm.getTime())
            .setTotaltime(pm.getTime())
            .setNumoccurrences(1);

    PMInfo dpmi = (PMInfo) getDelegate().find(pmi);
    if ( dpmi == null ) {
      getDelegate().put(pmi);
    } else {
      if ( pmi.getMintime() < dpmi.getMintime() )
        dpmi.setMintime(pmi.getMintime());

      if ( pmi.getMaxtime() > dpmi.getMaxtime() )
        dpmi.setMaxtime(pmi.getMaxtime());

      dpmi.setNumoccurrences(dpmi.getNumoccurrences() + 1);
      dpmi.setTotaltime(dpmi.getTotaltime() + pmi.getTotaltime());
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
