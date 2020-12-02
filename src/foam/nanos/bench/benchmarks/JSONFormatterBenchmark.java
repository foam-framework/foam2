/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.bench.benchmarks;

import foam.core.X;
import foam.lib.formatter.JSONFObjectFormatter;
import foam.nanos.auth.Subject;
import foam.nanos.auth.User;
import foam.nanos.bench.Benchmark;

public class JSONFormatterBenchmark
  implements Benchmark
{
  protected JSONFObjectFormatter f_ = new JSONFObjectFormatter(null);
  protected User                 u_ = null;

  @Override
  public void setup(X x) {
    u_ = ((Subject) x.get("subject")).getUser();
  }

  @Override
  public void teardown(X x, java.util.Map stats) {
  }

  @Override
  public void execute(X x) {
    f_.reset();
    f_.output(u_);
  }
}
