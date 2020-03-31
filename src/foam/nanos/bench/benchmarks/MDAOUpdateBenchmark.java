package foam.nanos.bench.benchmarks;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.MDAO;
import foam.nanos.auth.Country;
import foam.nanos.bench.Benchmark;

import java.util.Map;

public class MDAOUpdateBenchmark implements Benchmark {

  protected DAO dao_;
  protected Country a1_;

  @Override
  public void setup(X x) {
    dao_ = new MDAO(Country.getOwnClassInfo());
    ((MDAO) dao_).addIndex(new foam.core.PropertyInfo[] {Country.NAME});
    ((MDAO) dao_).addIndex(new foam.core.PropertyInfo[] {Country.CODE});

    a1_= new Country.Builder(x).setId("AA").setCode("AA").setName("AA").build();

    dao_.put_(x, a1_);
  }

  @Override
  public void teardown(X x, Map stats) {
  }

  @Override
  public void execute(X x) {
    a1_.setCode("BB");
    dao_.put_(x, a1_);
  }
}
