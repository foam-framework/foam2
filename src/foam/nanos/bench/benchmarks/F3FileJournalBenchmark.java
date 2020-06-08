/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.bench.benchmarks;

import foam.core.X;
import foam.dao.*;
import foam.nanos.auth.User;
import foam.nanos.bench.Benchmark;

public class F3FileJournalBenchmark
  implements Benchmark
{
  protected F3FileJournal journal_;
  protected DAO         dao_;

  @Override
  public void setup(X x) {
    dao_ = new NullDAO();
    journal_ = new F3FileJournal.Builder(x)
      .setDao(new MDAO(User.getOwnClassInfo()))
      .setFilename("f3journalbenchmark")
      .setCreateFile(true)
      .build();
  }

  @Override
  public void teardown(X x, java.util.Map stats) {
  }

  @Override
  public void execute(X x) {
    User u = new User();
    u.setId(System.currentTimeMillis());
    u.setFirstName("test");
    u.setLastName("testing");
    journal_.put(x, "", dao_, u);
  }
}