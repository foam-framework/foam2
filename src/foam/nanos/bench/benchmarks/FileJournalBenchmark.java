/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.bench.benchmarks;

import foam.core.X;
import foam.dao.FileJournal;
import foam.dao.DAO;
import foam.dao.MDAO;
import foam.dao.NullDAO;
import foam.nanos.auth.User;
import foam.nanos.bench.Benchmark;

public class FileJournalBenchmark
  implements Benchmark
{
  protected FileJournal journal_;
  protected DAO         dao_;

  @Override
  public void setup(X x) {
    dao_ = new NullDAO();
    journal_ = new FileJournal.Builder(x)
      .setDao(new MDAO(User.getOwnClassInfo()))
      .setFilename("journalbenchmark")
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

/*

Original:

2019.11.15.14.53.28.711,pool-1-thread-1,INFO,[Service],scriptDAO,admin admin (1348),FileJournalBenchmark,Fri Nov 15 14:53:28 EST 2019
Threads,Operations/s/t,Operations/s,Run,Memory MB
1,32258.064,32258.064,1,908.2078018188477
2,28571.428,57142.855,2,930.1205291748047
3,18518.518,55555.555,3,962.9894866943359
4,12658.228,50632.91,4,1006.8151626586914
5,10869.564,54347.824,5,168.64659118652344
6,12987.013,77922.08,6,240.10465240478516
7,11627.906,81395.34,7,316.65773010253906
8,10526.316,84210.53,8,406.14012908935547

With FastTimestamper:

2019.11.15.15.07.19.494,pool-1-thread-15,INFO,[Service],scriptDAO,admin admin (1348),FileJournalBenchmark,Fri Nov 15 15:07:19 EST 2019
Threads,Operations/s/t,Operations/s,Run,Memory MB
1,90909.09,90909.09,1,707.68798828125
2,47619.047,95238.09,2,730.8632888793945
3,35714.285,107142.85,3,767.0464248657227
4,20833.334,83333.336,4,815.4616775512695
5,14705.881,73529.41,5,877.0514907836914
6,11764.706,70588.234,6,139.4762420654297
7,19230.768,134615.38,7,231.0417022705078


2019.11.15.20.13.12.359,pool-1-thread-3,INFO,[Service],scriptDAO,admin admin (1348),FileJournalBenchmark,Fri Nov 15 20:13:12 EST 2019
Threads,Operations/s/t,Operations/s,Run,Memory MB
1,43478.26,43478.26,1,510.1215591430664
2,27777.78,55555.56,2,534.1389770507812
3,31249.998,93749.99,3,570.0587539672852
4,22222.22,88888.88,4,617.9570388793945
5,19607.844,98039.22,5,677.8227920532227
6,16129.032,96774.195,6,749.5987396240234
7,14084.507,98591.55,7,833.3383865356445



2019.11.15.20.16.32.661,pool-1-thread-2,INFO,[Service],scriptDAO,admin admin (1348),FileJournalBenchmark,Fri Nov 15 20:16:32 EST 2019
Threads,Operations/s/t,Operations/s,Run,Memory MB
1,55555.555,55555.555,1,596.9867401123047
2,34246.574,68493.15,2,837.6801910400391
3,54644.81,163934.42,3,1190.1226119995117
4,46296.297,185185.19,4,357.68041229248047
5,38022.812,190114.06,5,942.869255065918
6,31645.568,189873.4,6,337.75814056396484
7,27397.26,191780.81,7,1157.9142532348633
8,24038.46,192307.69,8,787.9957656860352

*/
