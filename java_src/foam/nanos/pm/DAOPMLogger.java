/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.pm;

import foam.core.ContextAwareSupport;
import foam.dao.MapDAO;
import foam.nanos.NanoService;

public class DAOPMLogger
  extends    ContextAwareSupport
  implements PMLogger, NanoService
{

  public static final String ServiceName = "pmLogger";

  private MapDAO dao_;

  @Override
  public void log(PM pm) {
    PMInfo pmi = new PMInfo()
            .setClsname(pm.getClassType().getName())
            .setPmname(pm.getName())
            .setMintime(pm.getTime())
            .setMaxtime(pm.getTime())
            .setTotaltime(pm.getTime())
            .setNumoccurrences(1);

    PMInfo dpmi = (PMInfo) dao_.find(pmi);
    if ( dpmi == null ) {
      dao_.put(pmi);
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
    dao_ = new MapDAO();
    dao_.setOf(PMInfo.getOwnClassInfo());
    dao_.setX(getX());
  }
}
