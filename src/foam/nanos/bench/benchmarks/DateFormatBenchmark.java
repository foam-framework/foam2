/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.bench.benchmarks;

import foam.core.X;
import foam.nanos.bench.Benchmark;
import java.text.SimpleDateFormat;

public class DateFormatBenchmark
  implements Benchmark
{
  protected SimpleDateFormat format_ = new SimpleDateFormat("yyyy.MM.dd.HH.mm.ss.SSS");

  @Override
  public void setup(X x) {
  }

  @Override
  public void teardown(X x, java.util.Map stats) {
  }

  @Override
  public synchronized void execute(X x) {
    format_.format(System.currentTimeMillis());
  }
}
