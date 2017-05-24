/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.boot;

import foam.core.*;
import foam.dao.*;
import foam.nanos.*;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;

public class Boot {
  protected DAO serviceDAO_;
  protected DAO userDAO_;
  protected DAO groupDAO_;
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

    ((AbstractDAO) serviceDAO_).select(new AbstractSink() {
      public void put(FObject obj, Detachable sub) {
        NSpec sp = (NSpec) obj;

        try {
          NanoService ns = sp.createService();
          ((ContextAwareSupport) ns).setX(root_);
          ns.start();
          root_.put(sp.getName(), ns);
        } catch (ClassNotFoundException e) {
           e.printStackTrace();
        } catch (InstantiationException e) {
           e.printStackTrace();
        } catch (IllegalAccessException e) {
           e.printStackTrace();
        }
      }
    });
  }

  protected void loadServices() {
    NSpec http = new NSpec();
    http.setName("http");
    http.setServiceClass("foam.nanos.http.NanoHttpServer");
    serviceDAO_.put(http);

    NSpec auth = new NSpec();
    auth.setName("auth");
    auth.setServiceClass("foam.nanos.auth.UserAndGroupAuthService");
    serviceDAO_.put(auth);
  }

  public static void main (String[] args) throws Exception {
    new Boot();
  }
}