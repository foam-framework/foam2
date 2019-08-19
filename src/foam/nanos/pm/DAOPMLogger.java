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

  protected X x_;
  protected final Object[] locks_ = new Object[128];

  @Override
  public void log(PM pm) {
    if ( ! pm.getClassType().getId().equals("foam.dao.PMDAO") ) {
      if ( pm.getClassType().getId().indexOf("PM") != -1 ) return;
      if ( pm.getName().indexOf("PM")              != -1 ) return;
      if ( pm.getClassType().getId().indexOf("pm") != -1 ) return;
      if ( pm.getName().indexOf("pm")              != -1 ) return;
    }

    foam.dao.DAO dao = (foam.dao.DAO) getX().get(PM_DAO_NAME);
    dao.put(pm);
  }
}
