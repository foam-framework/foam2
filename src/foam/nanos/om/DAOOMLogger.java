/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.om;

import foam.core.ContextAwareSupport;
import foam.dao.DAO;

public class DAOOMLogger
  extends    ContextAwareSupport
  implements OMLogger
{
  public final static String SERVICE_NAME = "omLogger";
  public final static String DAO_NAME     = "omInfoDAO";

  protected final Object[] locks_ = new Object[128];

  public DAOOMLogger() {
    for ( int i = 0 ; i < locks_.length ; i++ ) locks_[i] = new Object();
  }

  protected Object getLock(OMInfo info) {
    int hash = info.getClsName().hashCode() * 31 + info.getName().hashCode();
    return locks_[(int) (Math.abs(hash) % locks_.length)];
  }

  @Override
  public void log(OM om) {
    if ( ! om.getClassType().getId().equals("foam.dao.OMDAO") ) {
      if ( om.getClassType().getId().indexOf("OM") != -1 ) return;
      if ( om.getName().indexOf("OM")                != -1 ) return;
      if ( om.getClassType().getId().indexOf("om") != -1 ) return;
      if ( om.getName().indexOf("om")                != -1 ) return;
    }

    // TODO: could reuse the OMInfo by also using it as the lock object
    OMInfo info = new OMInfo.Builder(getX())
      .setClsName(om.getClassType().getId())
      .setName(om.getName())
      .build();

    DAO dao = (DAO) getX().get(DAO_NAME);

    synchronized ( getLock(info) ) {
      OMInfo i = (OMInfo) dao.inX(getX()).find(info);
      if ( i == null ) {
        i = info;
        i.setCount(1);
      } else {
        i = (OMInfo) i.fclone();
        i.setCount(i.getCount() + 1);
      }
      i.setLastModified(om.getCreated());
      dao.put(i);
    }
  }
}
