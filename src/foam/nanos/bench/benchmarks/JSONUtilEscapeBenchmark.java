/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.bench.benchmarks;

import foam.core.X;
import foam.nanos.bench.Benchmark;

public class JSONUtilEscapeBenchmark
  implements Benchmark
{
  protected StringBuilder b_ = new StringBuilder();

  @Override
  public void setup(X x) {
  }

  @Override
  public void teardown(X x, java.util.Map stats) {
  }

  @Override
  public void execute(X x) {
    b_.setLength(0);
    for ( int i = 0 ; i < 1000 ; i++ ) {
      foam.lib.json.Util.escape("abcdefg\n\t\\\u2605\\u0007xjxjxjxjxjxjxjxjxjxj", b_);
    }
  }
}
