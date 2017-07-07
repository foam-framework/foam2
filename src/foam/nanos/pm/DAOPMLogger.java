/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.pm;

import foam.core.ContextAwareSupport;
import foam.dao.DAO;

public class DAOPMLogger
  extends    ContextAwareSupport
  implements PMLogger
{
  public static final String ServiceName = "pmLogger";

  @Override
  public void log(PM pm) {
    PMInfo pmi = new PMInfo();
    pmi.setClsname(pm.getClassType().getName());
    pmi.setPmname(pm.getName());

    DAO pmd = (DAO) getX().get(PMDAO.ServiceName);

    PMInfo dpmi = (PMInfo) pmd.find(pmi);
    if ( dpmi == null ) {

      pmi.setMintime(pm.getTime());
      pmi.setMaxtime(pm.getTime());
      pmi.setTotaltime(pm.getTime());
      pmi.setNumoccurrences(1);

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
}
