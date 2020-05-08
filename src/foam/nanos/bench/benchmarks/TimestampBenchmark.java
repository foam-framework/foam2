/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.bench.benchmarks;

import foam.core.X;
import foam.nanos.bench.Benchmark;
import foam.util.FastTimestamper;

public class TimestampBenchmark
  implements Benchmark
{
  protected FastTimestamper ts_ = new FastTimestamper();

  @Override
  public void setup(X x) {
  }

  @Override
  public void teardown(X x, java.util.Map stats) {
  }

  @Override
  public synchronized void execute(X x) {
    ts_.createTimestamp();
  }
}
