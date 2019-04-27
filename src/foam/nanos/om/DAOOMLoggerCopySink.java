/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.om;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxySink;

/**
 * Copy an OMInfoDAO entries into other OMInfoDAOs.
 * Used for OM Rollup from, for example,
 * 1 minute into 5 minute.
 */
public class DAOOMLoggerCopySink
  extends foam.dao.AbstractSink {
  DAO[] toDAOs_;

  public DAOOMLoggerCopySink(X x, DAO[] toDAOs) {
    super(x);
    toDAOs_ = toDAOs;
  }

  public void put(Object obj, foam.core.Detachable sub) {
    if ( obj == null ) {
      return;
    }
    OMInfo info = (OMInfo) obj;
    for ( DAO dao : toDAOs_ ) {
      OMInfo i = (OMInfo) dao.find(info);
      if ( i == null ) {
        i = (OMInfo) info.fclone();
      } else {
        i = (OMInfo) i.fclone();
        i.setCount(i.getCount() + info.getCount());
      }
      if ( info.getLastModified().getTime() > i.getLastModified().getTime() ) {
        i.setLastModified(info.getLastModified());
      }
      dao.put(i);
    }
  }
}
