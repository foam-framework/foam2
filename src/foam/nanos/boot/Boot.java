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

import java.io.IOException;

public class Boot {
  protected DAO serviceDAO_;
  protected DAO userDAO_;
  protected DAO groupDAO_;
  protected DAO pmDAO_;
  protected X   root_ = new ProxyX();

  public Boot() {
    try {
      // Used for all the services that will be required when Booting
      serviceDAO_ = new JDAO(NSpec.getOwnClassInfo(), "services");
    } catch (IOException e) {
      e.printStackTrace();
    }

    try {
      // Used to hold all of the users in our system
      MapDAO userDAO = new MapDAO();
      userDAO.setOf(User.getOwnClassInfo());
      userDAO.setX(root_);
      userDAO_ = new JDAO(userDAO, "users");
      root_.put("userDAO", userDAO_);

      // Used for groups. We have multiple groups that contain different users
      MapDAO groupDAO = new MapDAO();
      groupDAO.setOf(Group.getOwnClassInfo());
      groupDAO.setX(root_);
      groupDAO_ = new JDAO(groupDAO, "groups");
      root_.put("groupDAO", groupDAO_);

    } catch (IOException e) {
      e.printStackTrace();
    }

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

    // Export the ServiceDAO
    ((ProxyDAO) root_.get("nSpecDAO")).setDelegate(serviceDAO_);

    serviceDAO_.where(foam.mlang.MLang.EQ(NSpec.LAZY, false)).select(new AbstractSink() {
      public void put(FObject obj, Detachable sub) {
        NSpec sp = (NSpec) obj;

        System.out.println("Starting: " + sp.getName());
        root_.get(sp.getName());
      }
    });
  }

  public static void main (String[] args)
    throws Exception
  {
    System.out.println("Starting Nanos Server");
    new Boot();
  }
}
