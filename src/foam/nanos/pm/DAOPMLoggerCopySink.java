/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.pm;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxySink;

/**
 * Copy an PMInfoDAO entries into other PMInfoDAOs.
 * Used for PM Rollup from, for example,
 * 1 minute into 5 minute.
 */
public class DAOPMLoggerCopySink
  extends foam.dao.AbstractSink {
  DAO[] toDAOs_;

  public DAOPMLoggerCopySink(X x, DAO[] toDAOs) {
    super(x);
    toDAOs_ = toDAOs;
  }

  public void put(Object obj, foam.core.Detachable sub) {
    if ( obj == null ) {
      return;
    }
    PMInfo info = (PMInfo) obj;
    for ( DAO dao : toDAOs_ ) {
      PMInfo i = (PMInfo) dao.find(info);
      if ( i == null ) {
        i = (PMInfo) info.fclone();
      } else {
        i = (PMInfo) i.fclone();
        if ( info.getMinTime() < i.getMinTime() )
          i.setMinTime(info.getMinTime());

        if ( info.getMaxTime() > i.getMaxTime() )
          i.setMaxTime(info.getMaxTime());

        i.setCount(i.getCount() + info.getCount());
        i.setTotalTime(i.getTotalTime() + info.getTotalTime());
      }
      dao.put(i);
    }
  }
}
