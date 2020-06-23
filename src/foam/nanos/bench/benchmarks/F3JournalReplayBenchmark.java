package foam.nanos.bench.benchmarks;

import foam.core.X;
import foam.dao.*;
import foam.nanos.auth.User;
import foam.nanos.bench.Benchmark;

public class F3JournalReplayBenchmark implements Benchmark {
  protected F3FileJournal journal_;
  protected DAO dao_;
  protected int userCount;

  public F3JournalReplayBenchmark(int userCount) {
    this.userCount = userCount;
  }

  @Override
  public void setup(X x) {
    dao_ = new NullDAO();
    journal_ = new F3FileJournal.Builder(x)
//      .setDao(new MDAO(User.getOwnClassInfo()))
      .setFilename("f3replaybenchmark")
      .setCreateFile(true)
      .build();
    journal_.setX(x);
    for (int i = 0; i < userCount; i ++ ) {
      User u = new User();
      u.setId(System.currentTimeMillis());
      u.setFirstName("test");
      u.setLastName("testing");
      journal_.put(x, "", dao_, u);
    }
  }

  @Override
  public void teardown(X x, java.util.Map stats) {
  }

  @Override
  public void execute(X x) {
    journal_.replay(x, new MDAO(User.getOwnClassInfo()));
  }
}
