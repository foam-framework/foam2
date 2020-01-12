/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.mrac;

import foam.core.X;
import foam.dao.DAO;

import foam.lib.json.Outputter;
import java.io.PrintWriter;

public class MNServiceImpl implements MNService {

  //TODO: close socketChannel;
  public void replayAll(X x, String serviceName) {
    System.out.println("replayreplayreplay");
    DAO dao = (DAO) x.get(serviceName);

    if ( dao == null ) throw new RuntimeException("DAO miss: " + serviceName);

    MNJournal journal = MNJournal.getMNjournal(x, serviceName + "s");

    //TODO: add sink
    journal.replay(x, dao);
    //TODO: activate sink.
  }

  public void sinkDAO(X x, String daoKey) {

  }

  public void serviceMate(X x, String serviceName) {
    DAO dao = (DAO) x.get("serviceName");
    if (dao == null ) throw new RuntimeException("DAO miss: " + serviceName);

    MNJournal journal = MNJournal.getMNjournal(x, serviceName + "s");

    MNServiceMate mate = new MNServiceMate();
    mate.setServiceName(serviceName);
    mate.setMaxIndex(journal.getCurrentMaxIndex());

    Outputter outputter = new Outputter(x);
    String msg = outputter.stringify(mate);
    PrintWriter out = x.get(PrintWriter.class);
    out.println(msg);
    return;

  }
  public void replayFrom(X x, String serviceName, long indexFrom) {
    System.out.println("replayFrom");
    DAO dao = (DAO) x.get(serviceName);
  }

  public void serviceMeta(X x, String serviceName) {

  }
}
