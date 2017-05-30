/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.pm;

import foam.core.ContextAwareSupport;
import foam.dao.MapDAO;
import foam.dao.ProxyDAO;
import foam.nanos.NanoService;

public class DAOPMLogger
  extends ContextAwareSupport
  implements PMLogger, NanoService
{

  public static final String ServiceName = "pmLogger";
  public static final String DAOName = "pmInfoDAO";

  @Override
  public void log(PM pm) {
    PMInfo pmi = new PMInfo()
            .setClsname(pm.getClassType().getName())
            .setPmname(pm.getName());

    MapDAO pmd = (MapDAO) getX().get("pmInfoDAO");

    PMInfo dpmi = (PMInfo) pmd.find(pmi);
    if ( dpmi == null ) {
      pmi.setMintime(pm.getTime())
              .setMaxtime(pm.getTime())
              .setTotaltime(pm.getTime())
              .setNumoccurrences(1);

      pmd.put(pmi);
    } else {
      if ( pm.getTime() < dpmi.getMintime() )
        dpmi.setMintime(pm.getTime());

      if ( pm.getTime() > dpmi.getMaxtime() )
        dpmi.setMaxtime(pm.getTime());

      dpmi.setNumoccurrences(dpmi.getNumoccurrences() + 1);
      dpmi.setTotaltime(dpmi.getTotaltime() + pm.getTime());
      pmd.put(dpmi);
    }
  }

  @Override
  public void start() {
    MapDAO dao = new MapDAO();
    dao.setOf(PMInfo.getOwnClassInfo());
    dao.setX(getX());
    getX().put(DAOName, dao);
  }
}
