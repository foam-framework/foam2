package foam.nanos.medusa.test;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.NullDAO;
import foam.dao.Sink;
import foam.test.TestUtils;

import foam.nanos.auth.Subject;
import foam.nanos.auth.User;
import foam.nanos.auth.Country;
import foam.nanos.boot.NSpec;
import foam.nanos.logger.Logger;
import foam.nanos.medusa.*;
import foam.nanos.session.*;

import java.util.List;

public class ClusterDAOTest
  extends foam.nanos.test.Test {

  X x_;

  @Override
  public void runTest(X x) {
    x_ = x;
    Logger logger = (Logger) x.get("logger");
    Subject subject = (Subject) x.get("subject");
    User user = subject.getUser();
    DAO sessionDAO = (DAO) x.get("sessionDAO");
    Session session = new Session.Builder(x)
      .setId("primary")
      .setUserId(user.getId())
      .setRemoteHost("127.0.0.1")
      .build();
    Session old = (Session) sessionDAO.find("primary");
    if ( old != null ) {
      sessionDAO.remove(old);
    }
    sessionDAO.put(session);

    session = new Session.Builder(x)
      .setId("secondary")
      .setUserId(user.getId())
      .setRemoteHost("127.0.0.1")
      .build();
    old = (Session) sessionDAO.find("secondary");
    if ( old != null ) {
      sessionDAO.remove(old);
    }
    sessionDAO.put(session);

    String serviceName = "countryDAO1";
    addNSpec(x, serviceName);

    ClusterConfig config = new ClusterConfig.Builder(x)
      .setId("primary")
      .setIsPrimary(true)
      .setAccessMode(AccessMode.RW)
      .setPort(8080)
      .setSessionId("primary")
      .build();
    ((DAO) x.get("clusterConfigDAO")).put(config);

    config = new ClusterConfig.Builder(x)
      .setId("secondary")
      .setIsPrimary(false)
      .setPort(8090)
      .setSessionId("secondary")
      .build();
    ((DAO) x.get("clusterConfigDAO")).put(config);

    // DAO client = new ClusterClientDAO.Builder(x)
    //   .setServiceName(serviceName)
    //   .build();

    DAO countryDAO1 = (DAO) x.get("countryDAO1");
    Sink sink = countryDAO1.select(new ArraySink());
    List countries = ((ArraySink) sink).getArray();
    test ( countries.size() == 0, "countryDAO1 empty");

    DAO countryDAO = (DAO) x.get("countryDAO");
    sink = countryDAO.select(new ArraySink());
    countries = ((ArraySink) sink).getArray();
    for ( Object c : countries ) {
      Country country = (Country) c;
      countryDAO1.put(country);
    }

    int numCountries = countries.size();
    sink = countryDAO1.select(new ArraySink());
    countries = ((ArraySink) sink).getArray();

    DAO dao = (DAO) x.get("clusterConfigDAO");
    String hostname = System.getProperty("hostname", "localhost");
    config = (ClusterConfig) dao.find_(x, hostname);
    test ( config != null, "ClusterConfig found");
    if ( config != null &&
         config.getIsPrimary() ) {
      test ( countries.size() == numCountries, "countryDAO1 equal to countryDAO");
    } else {
      test ( countries.size() == 0, "countryDAO1 size 0 - all puts to primary");
    }
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
      .setServiceScript("return new foam.dao.EasyDAO.Builder(x).setOf(foam.nanos.auth.Country.getOwnClassInfo()).setCluster(true).build();\\n")
      .setClient("{ \"class\":\"foam.nanos.auth.Country\", \"serviceName\": \"service/"+serviceName+"\"}")
      .build();

    nspec = (NSpec) dao.put(nspec);
    logger.debug("create NSpec", nspec);
  }
}
