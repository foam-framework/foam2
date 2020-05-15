package foam.nanos.bench.benchmarks;

import java.util.Map;
import foam.core.X;
import foam.nanos.bench.Benchmark;
import foam.nanos.bench.BenchmarkRunner;
import foam.nanos.bench.BenchmarkRunner.Builder;
import foam.nanos.pm.PM;

public class PMBenchmark implements Benchmark {

  @Override
  public void setup(X x) {
    // TODO Auto-generated method stub

  }

  @Override
  public void teardown(X x, Map stats) {
    // TODO Auto-generated method stub

  }

  @Override
  public void execute(X x) {
    PM pm = new PM(Object.class,"def");
    pm.log(x);
  }
}
