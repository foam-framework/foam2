/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.mrac;

import foam.core.X;
import foam.dao.DAO;

public class MNServiceImpl implements MNService {

  public void replayAll(X x, String serviceName) {
    //TODO: catch IOException close socket.
    System.out.println("replayreplayreplay");
    DAO dao = (DAO) x.get(serviceName);

    if ( dao == null ) throw new RuntimeException("DAO miss: " + serviceName);

    //TODO: Do not hard code journal name.
    MNJournal journal = MNJournal.getMNjournal(serviceName + "s");

    //TODO: add sink
    journal.replay(x, dao);
    //TODO: activate sink.
  }

  public void sinkDAO(X x, String daoKey) {

  }
}
