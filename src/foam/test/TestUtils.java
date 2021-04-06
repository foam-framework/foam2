/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.test;

import foam.core.ClassInfo;
import foam.core.X;
import foam.core.FObject;
import foam.dao.DAO;
import foam.dao.MDAO;
import foam.dao.ProxyDAO;
import foam.dao.SequenceNumberDAO;
import foam.nanos.auth.Group;
import foam.nanos.auth.GroupPermissionJunction;
import foam.nanos.auth.User;
import foam.nanos.fs.File;
import foam.nanos.session.Session;
import foam.util.Auth;
/**
 * Helper methods to make writing tests easier.
 */
public class TestUtils {
  /**
   * Mock out a DAO in the given context by replacing it with an undecorated, empty MDAO.
   * Will keep the same 'of' type.
   * @param x The context you're replacing the DAO in.
   * @param daoName The name of the DAO in the context you'd like to mock out.
   * @return A subcontext with the given DAO replaced with an MDAO of the same type.
   */
  public static X mockDAO(X x, String daoName) {
    DAO dao = (DAO) x.get(daoName);
    ClassInfo of = dao.getOf();
    return x.put(daoName, new MDAO(of));
  }

  /**
   * Create mockDAOs required by the Auth Service
  */
  public static X createAuthMockDAO(X x) {
    x = mockDAO(x, "localUserDAO");
    x = mockDAO(x, "localGroupPermissionJunctionDAO");
    x = mockDAO(x, "localGroupDAO");
    x = mockDAO(x, "userCapabilityJunctionDAO");
    x = applyDAOProxy(x, "userDAO", new SequenceNumberDAO.Builder(x).build(), (DAO) x.get("localUserDAO"));
    x = applyDAOProxy(x, "groupPermissionJunctionDAO", new ProxyDAO.Builder(x).build(), (DAO) x.get("localGroupPermissionJunctionDAO"));
    x = applyDAOProxy(x, "groupDAO", new ProxyDAO.Builder(x).build(), (DAO) x.get("localGroupDAO"));
    return x;
  }

  /**
   * Creates a user with some properties populated for testing.
   * @return A dummy user with populated fields.
   */
  public static User createTestUser() {
    User user  = new User();
    user.setFirstName("John");
    user.setLastName("Smith");
    user.setEmail("john@example.com");
    File profilePicFile = new File();
    profilePicFile.setFilename("Profile picture");
    user.setProfilePicture(profilePicFile);
    user.setLifecycleState(foam.nanos.auth.LifecycleState.ACTIVE);
    user.setEnabled(true);
    return user;
  }

  /**
   * Creates a user with some properties populated for testing.
   * @param group sets group to new user.
   * @return A dummy user with populated fields.
   */
  public static User createTestUser(String group) {
    User user  = createTestUser();
    user.setGroup(group);
    return user;
  }

  /**
    Applies a decorator/proxyDAO on provided DAO and set in context provided if daoName is given.
    @param daoName key of proxiedDAO in context
    @param proxy the proxyDAO to delegate to @param dao
    @param dao proxyDAO' delegate
   */
  public static X applyDAOProxy(X x, String daoName, ProxyDAO proxy, DAO dao) {
    proxy.setDelegate(dao);
    return x.put(daoName, proxy);
  }

  /**
    Create a simple session context with a test user, group and auth related DAOs.
    Includes self contained bareUserDAO and groupDAO so no user or group journals
    are updated related to the authorization of the current user.
    Auto authorize as admin with * permission under group {test_admin_group}
    and creates a test user and sets an empty test group {test_group} with no permissions.
    @param spid create test context acting within specified spid
  */

  public static X createTestContext(X x, String spid) {
    x = createAuthMockDAO(x);
    DAO userDAO = (DAO) x.get("userDAO");
    DAO groupDAO = (DAO) x.get("groupDAO");

    Group group = new Group.Builder(x)
      .setId("test_group")
      .build();
    group = (Group) groupDAO.put(group);

    Group admin_group = new Group.Builder(x)
      .setId("test_admin_group")
      .build();
    admin_group = (Group) groupDAO.put(admin_group);
    Auth.applyPermissionToGroup(x, admin_group.getId(), "*");

    User user = createTestUser();
    user.setGroup("test_group");
    user.setSpid(spid);
    user.setId(900);
    user = (User) userDAO.put(user);

    User adminUser = createTestUser();
    adminUser.setGroup("test_admin_group");
    adminUser.setSpid(spid);
    adminUser.setId(1);
    adminUser = (User) userDAO.put(adminUser);

    return Auth.sudo(x, adminUser, admin_group);
  }

  /**
   * Executes the function you give it in a try/catch block and checks if an exception was thrown. Will return true if:
   *   1. an exception was thrown, AND
   *   2. the exception matches the 'exceptionType' argument, AND
   *   3. the exception message matches the 'expectedExceptionMessage' argument.
   * Meant to be called like this:
   * <pre>
   *   test(
   *     TestUtils.testThrows(
   *       () -> doSomethingIllegal(a, b, c),
   *       "Permission denied.",
   *       AuthorizationException.class
   *     ),
   *     "Should throw an 'AuthorizationException' when you try to do something illegal."
   *   );
   * </pre>
   * @param fn
   * @param expectedExceptionMessage
   * @param exceptionType
   * @return
   */
  public static boolean testThrows(
      Runnable fn,
      String expectedExceptionMessage,
      Class exceptionType
  ) {
    boolean wasCorrectExceptionType = false;
    boolean threw = false;
    String returnedMessage = "";
    Throwable throwable = null;
    try {
      fn.run();
    } catch (Throwable t) {
      wasCorrectExceptionType = exceptionType.isInstance(t);
      threw = true;
      returnedMessage = t.getMessage();
      if ( ! wasCorrectExceptionType ) {
        System.out.println("Exception type mismatch.");
        System.out.println("EXPECTED: \""+exceptionType.getName()+"\"");
        System.out.println("ACTUAL  : \""+t.getClass().getName()+"\"");
        t.printStackTrace();
        throw t;
      }
    }
    if ( ! returnedMessage.equals(expectedExceptionMessage) ) {
      System.out.println("Error message was not correct.");
      System.out.println("EXPECTED: \"" + expectedExceptionMessage + "\"");
      System.out.println("ACTUAL  : \"" + returnedMessage + "\"");
    }
    return wasCorrectExceptionType && threw && returnedMessage.equals(expectedExceptionMessage);
  }
}
