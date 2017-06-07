/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.boot;

import foam.core.*;
import foam.dao.*;
import foam.mlang.*;
import foam.nanos.auth.*;
import foam.nanos.pm.*;
import foam.nanos.pm.PMDAO;

public class Boot {
  protected DAO serviceDAO_;
  protected DAO userDAO_;
  protected DAO groupDAO_;
  protected MapDAO pmDAO_;
  protected X   root_ = new ProxyX();

  public Boot() {
    //Used for all the services that will be required when Booting
    serviceDAO_ = new MapDAO();
    ((MapDAO) serviceDAO_).setOf(NSpec.getOwnClassInfo());
    ((MapDAO) serviceDAO_).setX(root_);

    //Used to hold all of the users in our system
    userDAO_ = new MapDAO();
    ((MapDAO) userDAO_).setOf(User.getOwnClassInfo());
    ((MapDAO) userDAO_).setX(root_);
    root_.put("userDAO", userDAO_);

    //Used for groups. We have multiple groups that contain different users
    groupDAO_ = new MapDAO();
    ((MapDAO) groupDAO_).setOf(Group.getOwnClassInfo());
    ((MapDAO) groupDAO_).setX(root_);
    root_.put("groupDAO", groupDAO_);

    loadServices();
    //loadTestData();

    ((AbstractDAO) serviceDAO_).select(new AbstractSink() {
      public void put(FObject obj, Detachable sub) {
        NSpec sp = (NSpec) obj;
        root_.putFactory(sp.getName(), new SingletonFactory(new NSpecFactory(sp)));
      }
    });

    /**
     * Revert root_ to non ProxyX to avoid letting children add new bindings.
     */
    root_ = root_.put("firewall", "firewall");

    ((AbstractDAO) serviceDAO_.where(foam.mlang.MLang.EQ(NSpec.LAZY, false))).select(new AbstractSink() {
      public void put(FObject obj, Detachable sub) {
        NSpec sp = (NSpec) obj;

        root_.get(sp.getName());
      }
    });
  }

  protected void loadServices() {
    NSpec dpl = new NSpec();
    dpl.setName(DAOPMLogger.ServiceName);
    dpl.setServiceClass(DAOPMLogger.class.getName());
    serviceDAO_.put(dpl);

    NSpec pmd = new NSpec();
    pmd.setName(PMDAO.ServiceName);
    pmd.setServiceClass(PMDAO.class.getName());
    serviceDAO_.put(pmd);
  }

  protected void loadTestData() {
    NSpec s = new NSpec();
    s.setName("http");
    s.setServiceClass("foam.nanos.http.NanoHttpServer");
    s.setLazy(false);
    serviceDAO_.put(s);

    NSpec authTest = new NSpec();
    authTest.setName("authTest");
    authTest.setServiceClass("foam.nanos.auth.UserAndGroupAuthServiceTest");
    authTest.setLazy(false);
    serviceDAO_.put(authTest);

    NSpec logger = new NSpec();
    logger.setName("logger");
    logger.setServiceClass("foam.nanos.logger.NanoLogger");
    logger.setLazy(false);
    serviceDAO_.put(logger);
  }

  public static void main (String[] args) throws Exception {
    new Boot();
  }
}
