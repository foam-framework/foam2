/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.boot;

import foam.core.*;
import foam.dao.*;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;
import foam.nanos.http.FileServlet;
import foam.nanos.pm.*;
import foam.nanos.pm.PMDAO;

public class Boot {
  protected DAO    serviceDAO_;
  protected DAO    userDAO_;
  protected DAO    groupDAO_;
  protected DAO    pmDAO_;
  protected X         root_ = new ProxyX();

  public Boot() {
    // Used for all the services that will be required when Booting
    MapDAO serviceDAO = new MapDAO();
    serviceDAO.setOf(NSpec.getOwnClassInfo());
    serviceDAO.setX(root_);
    serviceDAO_ = serviceDAO;

    // Used to hold all of the users in our system
    MapDAO userDAO = new MapDAO();
    userDAO.setOf(User.getOwnClassInfo());
    userDAO.setX(root_);
    userDAO_ = userDAO;
    root_.put("userDAO", userDAO_);

    // Used for groups. We have multiple groups that contain different users
    MapDAO groupDAO = new MapDAO();
    groupDAO.setOf(Group.getOwnClassInfo());
    groupDAO.setX(root_);
    groupDAO_ = groupDAO;
    root_.put("groupDAO", groupDAO_);

    loadServices();

    serviceDAO_.select(new AbstractSink() {
      public void put(FObject obj, Detachable sub) {
        NSpec sp = (NSpec) obj;
        System.out.println("Registering: " + sp.getName());
        root_.putFactory(sp.getName(), new SingletonFactory(new NSpecFactory(sp)));
      }
    });

    /**
     * Revert root_ to non ProxyX to avoid letting children add new bindings.
     */
    root_ = root_.put("firewall", "firewall");

    serviceDAO_.where(foam.mlang.MLang.EQ(NSpec.LAZY, false)).select(new AbstractSink() {
      public void put(FObject obj, Detachable sub) {
        NSpec sp = (NSpec) obj;

        System.out.println("Starting: " + sp.getName());
        root_.get(sp.getName());
      }
    });
  }

  protected void loadServices() {
    NSpec s = new NSpec();
    s.setName("http");
    s.setServiceClass("foam.nanos.http.NanoHttpServer");
    s.setLazy(false);
    serviceDAO_.put(s);

    NSpec dpl = new NSpec();
    dpl.setName(DAOPMLogger.ServiceName);
    dpl.setServiceClass(DAOPMLogger.class.getName());
    serviceDAO_.put(dpl);

    NSpec pmd = new NSpec();
    pmd.setName(PMDAO.ServiceName); // pmInfoDAO
    pmd.setServiceClass(PMDAO.class.getName());
    pmd.setServe(true);
    serviceDAO_.put(pmd);

    NSpec authTest = new NSpec();
    authTest.setName("authTest");
    authTest.setServiceClass("foam.nanos.auth.UserAndGroupAuthServiceTest");
    // authTest.setLazy(false);
    serviceDAO_.put(authTest);

    NSpec logger = new NSpec();
    logger.setName("logger");
    logger.setServiceClass("foam.nanos.logger.NanoLogger");
    serviceDAO_.put(logger);

    NSpec ping = new NSpec();
    ping.setName("ping");
    ping.setServiceClass("foam.nanos.http.PingService");
    serviceDAO_.put(ping);

    NSpec uptime = new NSpec();
    uptime.setName("uptime");
    uptime.setServiceClass("foam.nanos.http.UptimeServlet");
    uptime.setLazy(false);
    serviceDAO_.put(uptime);

    NSpec file = new NSpec();
    file.setName(FileServlet.SERVLET_NAME);
    file.setServiceClass(FileServlet.class.getName());
    serviceDAO_.put(file);
  }

  public static void main (String[] args)
    throws Exception
  {
    System.out.println("Starting Nanos Server");
    new Boot();
  }
}
