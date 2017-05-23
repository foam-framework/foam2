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

  MapDAO dao_;

  @Override
  public void log(PM pm) {
    PMInfo pmi = (PMInfo) dao_.find(pm);

    if ( pmi == null ) {
      pmi = new PMInfo()
          .setClsname(pm.getClassType().getName())
          .setPmname(pm.getName())
          .setMintime(pm.getTime())
          .setMaxtime(pm.getTime())
          .setTotaltime(pm.getTime())
          .setNumoccurrences(1);
    }

    if ( pm.getTime() < pmi.getMintime() )
      pmi.setMintime(pm.getTime());

    if ( pm.getTime() > pmi.getMaxtime() )
      pmi.setMaxtime(pm.getTime());

    pmi.setNumoccurrences(pmi.getNumoccurrences() + 1);
    pmi.setTotaltime(pmi.getTotaltime() + pm.getTime());

    dao_.put(pmi);
  }

  @Override
  public void start() {
    dao_ = new MapDAO();
    dao_.setOf(PMInfo.getOwnClassInfo());
    dao_.setX(getX());
  }
}
