/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.pm;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.MDAO;
import foam.util.concurrent.FoldReducer;
import java.util.HashMap;
import java.util.Map;

public class FoldReducePMLogger
  extends    FoldReducer
  implements PMLogger
{
  public final static String SERVICE_NAME      = "pmLogger";
  public final static String PM_DAO_NAME       = "pmDAO";
  public final static String PM_INFO_DAO_NAME  = "pmInfoDAO";


  public FoldReducePMLogger() {
  }


  /** Template method to Create initial state. **/
  public Object initialState() {
    return new HashMap();
  }


  /** Template method to Fold a new update into a state. **/
  public void fold(Object state, Object op) {
    Map map = (Map) state;
    PM  pm  = (PM) op;

    // Regular PMInfo
    PMInfo pi = new PMInfo();
    pi.setKey(pm.getKey());
    pi.setName(pm.getName());

    PMInfo pi2 = (PMInfo) map.get(pi);
    if ( pi2 != null ) {
      pi = pi2;
      pi.fold(pm);
      if ( pi.getCapture() ) capture(pi);
    } else {
      pi.setMinTime(pm.getTime());
      pi.setMaxTime(pm.getTime());
      pi.setTotalTime(pm.getTime());
      pi.setCount(1);
      map.put(pi, pi);
    }
  }


  public void capture(PMInfo pi) {
    StringBuilder trace = new StringBuilder();
    for ( StackTraceElement j : Thread.currentThread().getStackTrace() ) {
      trace.append(j.toString());
      trace.append(System.getProperty("line.separator"));
    }

    pi.setCapture(false);
    pi.setCaptureTrace(trace.toString());
  }


  /** Template method to Merge two states. **/
  public Object reduce(Object state1, Object state2) {
    Map<PMInfo,PMInfo> m1 = (Map<PMInfo,PMInfo>) state1;
    Map<PMInfo,PMInfo> m2 = (Map<PMInfo,PMInfo>) state2;

    for ( Map.Entry<PMInfo,PMInfo> e : m2.entrySet() ) {
      PMInfo pi1 = (PMInfo) m1.get(e.getKey());
      PMInfo pi2 = (PMInfo) e.getValue();

      if ( pi2 == null ) {
        m1.put(pi2, pi2);
      } else {
        pi1.reduce(pi2);
      }
    }

    return state1;
  }


  @Override
  public void log(PM pm) {
    if (
      // TODO: maybe an exclusion list for names in this package instead
      //       of an inclusion list for names in outside packages
      ! pm.getKey().equals("foam.dao.PMDAO") &&
      ! pm.getKey().equals("foam.dao.PipelinePMDAO") &&
      ! pm.getKey().equals("foam.nanos.auth.PMAuthService")
    ) {
      if ( pm.getKey().indexOf("PM")  != -1 ) return;
      if ( pm.getName().indexOf("PM") != -1 ) return;
      if ( pm.getKey().indexOf("pm")  != -1 ) return;
      if ( pm.getName().indexOf("pm") != -1 ) return;
      if ( pm.getName().indexOf("LogMessage") != -1 ) return;
    }

    this.fold(pm);
  }


  public synchronized DAO asDAO() {
    Map  m   = (Map) getState();
    MDAO dao = new MDAO(foam.nanos.pm.PMInfo.getOwnClassInfo());

    for ( Object pi : m.values() ) dao.put((PMInfo) pi);

    return dao;
  }

}
