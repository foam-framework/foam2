/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.bench.benchmarks;

import foam.core.X;
import foam.nanos.bench.Benchmark;
import foam.nanos.logger.Logger;

public class LoggingBenchmark
  implements Benchmark
{
  protected Logger logger_;

  @Override
  public void setup(X x) {
    logger_ = (Logger) x.get("logger");
  }

  @Override
  public void teardown(X x, java.util.Map stats) {
  }

  @Override
  public void execute(X x) {
    logger_.log("this","is","a","test",42,'c',System.currentTimeMillis());
  }
}

/*
2019.11.15.14.11.35.523,pool-1-thread-5,INFO,[Service],scriptDAO,admin admin (1348),LoggingBenchmark,Fri Nov 15 14:11:35 EST 2019
Threads,Operations/s/t,Operations/s,Run,Memory MB
1,83333.336,83333.336,1,557.7270889282227
2,71428.57,142857.14,2,564.9915618896484
3,52631.58,157894.73,3,575.8130187988281
4,30303.031,121212.125,4,591.1154479980469
5,20408.164,102040.82,5,613.6156616210938
6,18181.818,109090.91,6,641.6714782714844
7,17543.86,122807.016,7,676.1507186889648
8,14285.714,114285.71,8,717.6735382080078
*/
