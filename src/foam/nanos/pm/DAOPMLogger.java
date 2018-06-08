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
  public final static String SERVICE_NAME = "pmLogger";
  public final static String DAO_NAME     = "pmInfoDAO";

  protected final Object[] locks_ = new Object[128];

  public DAOPMLogger() {
    for ( int i = 0 ; i < locks_.length ; i++ ) locks_[i] = new Object();
  }

  protected Object getLock(PMInfo pmi) {
    int hash = pmi.getClsName().hashCode() * 31 + pmi.getPmName().hashCode();
    return locks_[(int) (Math.abs(hash) % locks_.length)];
  }

  @Override
  public void log(PM pm) {
    if ( pm.getClassType().getName().indexOf("PM") != -1 ) return;
    if ( pm.getName().indexOf("PM")                != -1 ) return;
    if ( pm.getClassType().getName().indexOf("pm") != -1 ) return;
    if ( pm.getName().indexOf("pm")                != -1 ) return;

    PMInfo pmi = new PMInfo();
    pmi.setClsName(pm.getClassType().getName());
    pmi.setPmName(pm.getName());

    DAO pmd = (DAO) getX().get(DAO_NAME);

    synchronized ( getLock(pmi) ) {
      PMInfo dpmi = (PMInfo) pmd.find(pmi);
      if ( dpmi == null ) {
        pmi.setMinTime(pm.getTime());
        pmi.setMaxTime(pm.getTime());
        pmi.setTotalTime(pm.getTime());
        pmi.setCount(1);

        pmd.put(pmi);
      } else {
        if ( pm.getTime() < dpmi.getMinTime() )
          dpmi.setMinTime(pm.getTime());

        if ( pm.getTime() > dpmi.getMaxTime() )
          dpmi.setMaxTime(pm.getTime());

        dpmi.setCount(dpmi.getCount() + 1);
        dpmi.setTotalTime(dpmi.getTotalTime() + pm.getTime());
        pmd.put(dpmi);
      }
    }
  }
}
