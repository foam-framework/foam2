/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.pm;

import foam.core.X;
import foam.core.ContextAwareSupport;
import foam.dao.DAO;

public class DAOPMLogger
  extends    ContextAwareSupport
  implements PMLogger
{
  public final static String SERVICE_NAME      = "pmLogger";
  public final static String PM_DAO_NAME       = "pmDAO";
  public final static String PM_INFO_DAO_NAME  = "pmInfoDAO";

  protected X x_;
  protected final Object[] locks_ = new Object[128];

  public DAOPMLogger() {
    for ( int i = 0 ; i < locks_.length ; i++ ) locks_[i] = new Object();
  }

  protected Object getLock(PMInfo pmi) {
    int hash = pmi.getClsName().hashCode() * 31 + pmi.getName().hashCode();
    return locks_[(int) (Math.abs(hash) % locks_.length)];
  }

  @Override
  public void log(PM pm) {
    if ( ! pm.getClassType().getId().equals("foam.dao.PMDAO") ) {
      if ( pm.getClassType().getId().indexOf("PM") != -1 ) return;
      if ( pm.getName().indexOf("PM")              != -1 ) return;
      if ( pm.getClassType().getId().indexOf("pm") != -1 ) return;
      if ( pm.getName().indexOf("pm")              != -1 ) return;
    }

    // Candlestick
    foam.dao.DAO dao = (foam.dao.DAO) getX().get(PM_DAO_NAME);
    if ( dao != null ) {
      dao.put(pm);
    }

    // Regular PMInfo
    // TODO: could reuse the PMInfo by also using it as the lock object
    PMInfo pmi = new PMInfo();
    pmi.setClsName(pm.getClassType().getId());
    pmi.setName(pm.getName());

    DAO pmd = (DAO) getX().get(PM_INFO_DAO_NAME);

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

        if ( dpmi.getCapture() ) {
          StringBuilder trace = new StringBuilder();
          for ( StackTraceElement j : Thread.currentThread().getStackTrace() ) {
            trace.append(j.toString());
            trace.append(System.getProperty("line.separator"));
          }
          dpmi.setCapture(false);
          dpmi.setCaptureTrace(trace.toString());
        }
      }
    }
  }
}
