/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.bench;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.ArraySink;
import foam.dao.Sink;
import foam.nanos.auth.User;

import java.util.List;

public class HashingBenchmark
    implements Benchmark
{
  List users = null;
  protected DAO userDAO_;

  @Override
  public void setup(X x) {
    userDAO_ = (DAO) x.get("localUserDAO");

    Sink sink = new ArraySink();
    sink = userDAO_.select(sink);
    users = ((ArraySink) sink).getArray();
  }

  @Override
  public void execute(X x) {
    try {
      // get random user
      int n = (int) (Math.random() * users.size());
      ((User) users.get(n)).hash();
    } catch (Throwable t) {
      t.printStackTrace();
    }
  }
}
