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

    DAO dao = (DAO) x.get(serviceName);

    if ( dao == null ) throw new RuntimeException("DAO miss: " + serviceName);

    MNJournal journal = MNJournal.getMNjournal(serviceName);

    journal.replay(x, dao);
  }
}
