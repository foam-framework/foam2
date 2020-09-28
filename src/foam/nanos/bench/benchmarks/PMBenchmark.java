/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.bench.benchmarks;

import foam.core.X;
import foam.nanos.bench.Benchmark;
import foam.nanos.bench.BenchmarkRunner;
import foam.nanos.bench.BenchmarkRunner.Builder;
import foam.nanos.pm.*;
import java.util.Map;

public class PMBenchmark
  implements Benchmark
{

  @Override
  public void setup(X x) {
    System.err.println("*************************************** setup: " + x.get("pmLogger"));
  }

  @Override
  public void teardown(X x, Map stats) {
  }

  @Override
  public void execute(X x) {
    PMLogger pmLogger = (PMLogger) x.get("pmLogger");
    PM pm = new PM(Object.class, "def");
//    pm.log(x);
pmLogger.log(pm);
    PM pm2 = new PM(foam.nanos.bench.Benchmark.class, "def");
    pmLogger.log(pm2);
//    pm2.log(x);
  }
}
