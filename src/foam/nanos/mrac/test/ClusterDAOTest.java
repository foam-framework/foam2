package foam.nanos.mrac.test;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.NullDAO;
import foam.dao.Sink;
import foam.test.TestUtils;

import foam.nanos.auth.Country;
import foam.nanos.boot.NSpec;
import foam.nanos.logger.Logger;
import foam.nanos.mrac.*;

import java.util.List;

public class ClusterDAOTest
  extends foam.nanos.test.Test {

  X x_;

  @Override
  public void runTest(X x) {
    x_ = x;
    Logger logger = (Logger) x.get("logger");

    String serviceName = "countryDAO1";
    addNSpec(x, serviceName);

    // DAO clusterDAO = new ClusterDAO.Builder(x)
    //   .setDelegate(new NullDAO.Builder(x).build())
    //   .setServiceName(serviceName)
    //   .build();
    ClusterConfig config = new ClusterConfig.Builder(x)
      .setId("localhost")
      .setNodeType(NodeType.PRIMARY)
      .setPort(8080)
      .build();

    DAO client = new ClusterClientDAO.Builder(x).setServiceName(serviceName).setConfig(config).build();

    DAO countryDAO1 = (DAO) x.get("countryDAO1");
    Sink sink = countryDAO1.select(new ArraySink());
    List countries = ((ArraySink) sink).getArray();
    test ( countries.size() == 0, "countryDAO1 empty");

    DAO countryDAO = (DAO) x.get("countryDAO");
    sink = countryDAO.select(new ArraySink());
    countries = ((ArraySink) sink).getArray();
    for ( Object c : countries ) {
      Country country = (Country) c;
      client.put(country);
    }

    int numCountries = countries.size();
    sink = countryDAO1.select(new ArraySink());
    countries = ((ArraySink) sink).getArray();
    test ( countries.size() == numCountries, "countryDAO1 equal to countryDAO");
  }

  public void addNSpec(X x, String serviceName) {
    Logger logger = (Logger) x.get("logger");
    logger.debug(this.getClass().getSimpleName(), "addServicer", serviceName);
    DAO dao = (DAO) x.get("nSpecDAO");

    NSpec nspec = new NSpec.Builder(x)
      .setId(serviceName)
      .setName(serviceName)
      .setAuthenticate(false)
      .setPm(true)
      .setServe(true)
      .setLazy(false)
      .setServiceScript("return new foam.dao.EasyDAO.Builder(x).setJournaled(true).setJournalName(\""+serviceName+"\").setOf(foam.nanos.auth.Country.getOwnClassInfo()).setCluster(true).build();\\n")
      .build();

    nspec = (NSpec) dao.put(nspec);
    logger.debug("create NSpec", nspec);
  }
}
