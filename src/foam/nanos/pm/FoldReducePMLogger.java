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
import foam.dao.ProxyDAO;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.util.concurrent.FoldReducer;
import java.util.HashMap;
import java.util.Map;

public class FoldReducePMLogger
  extends    FoldReducer
  implements PMLogger
{

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
    Object key = pm.getKey() + ":" + pm.getName();
    PMInfo pi  = (PMInfo) map.get(key);

    if ( pi == null ) {
      pi = new PMInfo();
      pi.setKey(pm.getKey());
      pi.setName(pm.getName());
      map.put(key, pi);
    }

    pi.fold(pm);
    if ( pi.getCapture() ) capture(pi);
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
    Map<String,PMInfo> m1 = (Map<String,PMInfo>) state1;
    Map<String,PMInfo> m2 = (Map<String,PMInfo>) state2;

    for ( PMInfo pi2 : m2.values() ) {
      PMInfo pi1 = m1.get(pi2);

      if ( pi1 == null ) {
        m1.put(pi2.getKey() + ":" + pi2.getName(), pi2);
      } else {
        pi1.reduce(pi2);
      }
    }

    return state1;
  }


  @Override
  public void log(PM pm) {
    if (
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
    return new ProxyDAO() {
      public DAO getDelegate() {
        synchronized ( FoldReducePMLogger.this ) {
          Map  m   = (Map) getState();
          MDAO dao = new MDAO(foam.nanos.pm.PMInfo.getOwnClassInfo());

          for ( Object pi : m.values() ) dao.put((PMInfo) pi);

          return dao;
        }
      }
      public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
        resetState();
      }
    };
  }

}
