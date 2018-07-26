/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import foam.core.X;
import foam.nanos.auth.*;
import foam.test.TestObj;
import foam.test.TestUtils;
import foam.util.Auth;

import java.security.AccessControlException;
import java.util.List;

public class AuthenticatedDAOTest
  extends foam.nanos.test.Test
{
  private Group basicUserGroup_;
  private Group adminGroup_;
  private User testUser_;
  private DAO userDAO_;
  private String INVALID_DAO_MESSAGE = "When using a DAO decorated by AuthenticatedDAO, you may only call the context-oriented methods: put_(), find_(), select_(), remove_(), removeAll_(), pipe_(), and listen_(). Alternatively, you can also use .inX() to set the context on the DAO.";

  public void runTest(X x) {
    x = getTestingSubcontext(x);

    AuthenticatedDAO_NonContextMethods_findThrowsException(x);
    AuthenticatedDAO_NonContextMethods_putThrowsException(x);
    AuthenticatedDAO_NonContextMethods_removeThrowsException(x);
    AuthenticatedDAO_NonContextMethods_removeAllThrowsException(x);
    AuthenticatedDAO_NonContextMethods_selectThrowsException(x);

    // Set the test user to be part of a basic user group with no permissions.
    testUser_.setGroup(basicUserGroup_.getId());
    userDAO_.put(testUser_);
    X basicUserContext = Auth.sudo(x, testUser_);

    AuthenticatedDAO_ContextMethods_UnauthorizedUser_find(basicUserContext);
    AuthenticatedDAO_ContextMethods_UnauthorizedUser_put(basicUserContext);
    AuthenticatedDAO_ContextMethods_UnauthorizedUser_remove(basicUserContext);
    AuthenticatedDAO_ContextMethods_UnauthorizedUser_removeAll(basicUserContext);
    AuthenticatedDAO_ContextMethods_UnauthorizedUser_select(basicUserContext);

    // Set the test user to be part of a user group with all permissions.
    testUser_.setGroup(adminGroup_.getId());
    userDAO_.put(testUser_);
    X adminUserContext = Auth.sudo(x, testUser_);

    AuthenticatedDAO_ContextMethods_AuthorizedUser_find(adminUserContext);
    AuthenticatedDAO_ContextMethods_AuthorizedUser_put_create(adminUserContext);
    AuthenticatedDAO_ContextMethods_AuthorizedUser_put_update(adminUserContext);
    AuthenticatedDAO_ContextMethods_AuthorizedUser_remove(adminUserContext);
    AuthenticatedDAO_ContextMethods_AuthorizedUser_removeAll(adminUserContext);
    AuthenticatedDAO_ContextMethods_AuthorizedUser_select(adminUserContext);
  }

  private X getTestingSubcontext(X x) {
    // Mock the userDAO and put a test user in it.
    x = TestUtils.mockDAO(x, "localUserDAO");
    userDAO_ = (DAO) x.get("localUserDAO");
    testUser_ = TestUtils.createTestUser();
    userDAO_.put(testUser_);

    // Mock the groupDAO.
    x = TestUtils.mockDAO(x, "groupDAO");
    DAO groupDAO = (DAO) x.get("groupDAO");

    // Put a group in the groupDAO with permission to read, update, and delete the testObjDAO.
    Permission adminPermissions[] = new Permission[5];
    Permission READ_PERMISSION = new Permission();
    Permission CREATE_PERMISSION = new Permission();
    Permission UPDATE_PERMISSION = new Permission();
    Permission REMOVE_PERMISSION = new Permission();
    Permission DELETE_PERMISSION = new Permission();
    READ_PERMISSION.setId("testObj.read.*");
    CREATE_PERMISSION.setId("testObj.create");
    UPDATE_PERMISSION.setId("testObj.update.*");
    REMOVE_PERMISSION.setId("testObj.remove.*");
    DELETE_PERMISSION.setId("testObj.delete.*");
    adminPermissions[0] = READ_PERMISSION;
    adminPermissions[1] = CREATE_PERMISSION;
    adminPermissions[2] = UPDATE_PERMISSION;
    adminPermissions[3] = REMOVE_PERMISSION;
    adminPermissions[4] = DELETE_PERMISSION;

    adminGroup_ = new Group();
    adminGroup_.setId("admin");
    adminGroup_.setEnabled(true);
    adminGroup_.setPermissions(adminPermissions);
    groupDAO.put(adminGroup_);

    // Put a group in the groupDAO with permission to read only one specific testObj.
    Permission basicUserPermissions[] = new Permission[3];
    Permission READ_SPECIFIC_TESTOBJ = new Permission();
    Permission DELETE_SPECIFIC_TESTOBJ = new Permission();
    Permission REMOVE_SPECIFIC_TESTOBJ = new Permission();
    READ_SPECIFIC_TESTOBJ.setId("testObj.read.public");
    DELETE_SPECIFIC_TESTOBJ.setId("testObj.delete.public");
    REMOVE_SPECIFIC_TESTOBJ.setId("testObj.remove.public");
    basicUserPermissions[0] = READ_SPECIFIC_TESTOBJ;
    basicUserPermissions[1] = DELETE_SPECIFIC_TESTOBJ;
    basicUserPermissions[2] = REMOVE_SPECIFIC_TESTOBJ;

    basicUserGroup_ = new Group();
    basicUserGroup_.setId("basic");
    basicUserGroup_.setEnabled(true);
    basicUserGroup_.setPermissions(basicUserPermissions);
    groupDAO.put(basicUserGroup_);

    // Mock the AuthService.
    UserAndGroupAuthService auth = new UserAndGroupAuthService(x);
    auth.start();
    x = x.put("auth", auth);

    return x;
  }

  private void AuthenticatedDAO_NonContextMethods_findThrowsException(X x) {
    // Create the decorated DAO to test.
    DAO testObjDAO = new MDAO(TestObj.getOwnClassInfo());
    ProxyDAO dao = new AuthenticatedDAO("testObj", testObjDAO);

    // Populate the DAO: Put something in to try to find.
    TestObj testObj = new TestObj.Builder(x).setId("123").build();
    testObjDAO.put(testObj);

    test(
      TestUtils.testThrows(
        () -> dao.find(testObj),
        INVALID_DAO_MESSAGE,
        AccessControlException.class
      ),
      "Should throw 'AccessControlException' with appropriate message when a user tries to 'find' from the DAO."
    );
  }

  private void AuthenticatedDAO_NonContextMethods_putThrowsException(X x) {
    // Create the decorated DAO to test.
    DAO testObjDAO = new MDAO(TestObj.getOwnClassInfo());
    ProxyDAO dao = new AuthenticatedDAO("testObj", testObjDAO);

    // Create an object to try to put.
    TestObj testObj = new TestObj.Builder(x).setId("123").build();

    test(
      TestUtils.testThrows(
        () -> dao.put(testObj),
        INVALID_DAO_MESSAGE,
        AccessControlException.class
      ),
      "Should throw 'AccessControlException' with appropriate message when a user tries to 'put' to the DAO."
    );
  }

  private void AuthenticatedDAO_NonContextMethods_removeThrowsException(X x) {
    // Create the decorated DAO to test.
    DAO testObjDAO = new MDAO(TestObj.getOwnClassInfo());
    ProxyDAO dao = new AuthenticatedDAO("testObj", testObjDAO);

    // Create an object to try to remove.
    TestObj testObj = new TestObj.Builder(x).setId("123").build();
    testObjDAO.put(testObj);

    test(
      TestUtils.testThrows(
        () -> dao.remove(testObj),
        INVALID_DAO_MESSAGE,
        AccessControlException.class
      ),
      "Should throw 'AccessControlException' with appropriate message when a user tries to 'remove' from the DAO."
    );
  }

  private void AuthenticatedDAO_NonContextMethods_removeAllThrowsException(X x) {
    // Create the decorated DAO to test.
    DAO testObjDAO = new MDAO(TestObj.getOwnClassInfo());
    ProxyDAO dao = new AuthenticatedDAO("testObj", testObjDAO);

    // Create an object to try to remove.
    TestObj testObj = new TestObj.Builder(x).setId("123").build();
    testObjDAO.put(testObj);

    test(
      TestUtils.testThrows(
        dao::removeAll,
        INVALID_DAO_MESSAGE,
        AccessControlException.class
      ),
      "Should throw 'AccessControlException' with appropriate message when a user tries to 'removeAll' from the DAO."
    );
  }

  private void AuthenticatedDAO_NonContextMethods_selectThrowsException(X x) {
    // Create the decorated DAO to test.
    DAO testObjDAO = new MDAO(TestObj.getOwnClassInfo());
    ProxyDAO dao = new AuthenticatedDAO("testObj", testObjDAO);

    // Create an object to try to select.
    TestObj testObj = new TestObj.Builder(x).setId("123").build();
    testObjDAO.put(testObj);

    test(
      TestUtils.testThrows(
        dao::select,
        INVALID_DAO_MESSAGE,
        AccessControlException.class
      ),
      "Should throw 'AccessControlException' with appropriate message when a user tries to 'select' from the DAO."
    );
  }

  private void AuthenticatedDAO_ContextMethods_UnauthorizedUser_find(X x) {
    // Create the decorated DAO to test.
    DAO testObjDAO = new MDAO(TestObj.getOwnClassInfo());
    ProxyDAO dao = new AuthenticatedDAO("testObj", testObjDAO);

    // Create an object to try to select.
    TestObj testObj = new TestObj.Builder(x).setId("123").build();
    testObjDAO.put(testObj);

    test(
      TestUtils.testThrows(
        () -> dao.find_(x, testObj),
        "Insufficient permissions",
        AccessControlException.class
      ),
      "Should throw 'AccessControlException' with appropriate message when an unauthenticated user tries to 'find_' from the DAO."
    );
  }

  private void AuthenticatedDAO_ContextMethods_UnauthorizedUser_put(X x) {
    // Create the decorated DAO to test.
    DAO testObjDAO = new MDAO(TestObj.getOwnClassInfo());
    ProxyDAO dao = new AuthenticatedDAO("testObj", testObjDAO);

    // Create an object to try to put.
    TestObj testObj = new TestObj.Builder(x).setId("123").build();

    test(
      TestUtils.testThrows(
        () -> dao.put_(x, testObj),
        "Insufficient permissions",
        AccessControlException.class
      ),
      "Should throw 'AccessControlException' with appropriate message when an unauthenticated user tries to 'put_' to the DAO."
    );
  }

  private void AuthenticatedDAO_ContextMethods_UnauthorizedUser_remove(X x) {
    // Create the decorated DAO to test.
    DAO testObjDAO = new MDAO(TestObj.getOwnClassInfo());
    ProxyDAO dao = new AuthenticatedDAO("testObj", testObjDAO);

    // Create an object to try to remove.
    TestObj testObj = new TestObj.Builder(x).setId("123").build();
    testObjDAO.put(testObj);

    test(
      TestUtils.testThrows(
        () -> dao.remove_(x, testObj),
        "Insufficient permissions",
        AccessControlException.class
      ),
      "Should throw 'AccessControlException' with appropriate message when an unauthenticated user tries to 'remove_' from the DAO."
    );
  }

  private void AuthenticatedDAO_ContextMethods_UnauthorizedUser_select(X x) {
    // Create the decorated DAO to test.
    DAO testObjDAO = new MDAO(TestObj.getOwnClassInfo());
    ProxyDAO dao = new AuthenticatedDAO("testObj", testObjDAO);

    // Put an object that the user should be allowed to read.
    TestObj publicTestObj = new TestObj.Builder(x).setId("public").setDescription("Basic user has permission to read this").build();
    testObjDAO.put(publicTestObj);

    // Put an object that the user should not be allowed to read.
    TestObj privateTestObj = new TestObj.Builder(x).setId("private").setDescription("Basic user does not have permission to read this").build();
    testObjDAO.put(privateTestObj);

    ArraySink sink = new ArraySink();
    dao.select_(x, sink, 0, 1000, null, null);
    List arr = sink.getArray();
    test(arr.size() == 1 && arr.get(0).equals(publicTestObj), "When a user uses the 'select_' method, it should only return the objects that the user has permission to read.");
  }

  private void AuthenticatedDAO_ContextMethods_UnauthorizedUser_removeAll(X x) {
    // Create the decorated DAO to test.
    DAO testObjDAO = new MDAO(TestObj.getOwnClassInfo());
    ProxyDAO dao = new AuthenticatedDAO("testObj", testObjDAO);

    // Put an object that the user should be allowed to read.
    TestObj publicTestObj = new TestObj.Builder(x).setId("public").setDescription("Basic user has permission to read this").build();
    testObjDAO.put(publicTestObj);

    // Put an object that the user should not be allowed to read.
    TestObj privateTestObj = new TestObj.Builder(x).setId("private").setDescription("Basic user does not have permission to read this").build();
    testObjDAO.put(privateTestObj);

    // Call removeAll_ as a basic user.
    dao.removeAll_(x, 0, 1000, null, null);

    // Select on the underlying DAO to see if it was removed.
    ArraySink sink = new ArraySink();
    testObjDAO.select(sink);
    List arr = sink.getArray();
    test(arr.size() == 1 && arr.get(0).equals(privateTestObj), "When a user uses the 'removeAll_' method, it should only remove the objects that the user has permission to delete.");
  }

  private void AuthenticatedDAO_ContextMethods_AuthorizedUser_find(X x) {
    // Create the decorated DAO to test.
    DAO testObjDAO = new MDAO(TestObj.getOwnClassInfo());
    ProxyDAO dao = new AuthenticatedDAO("testObj", testObjDAO);

    // Create an object to try to find.
    TestObj testObj = new TestObj.Builder(x).setId("123").build();
    testObjDAO.put(testObj);

    try {
      TestObj result = (TestObj) dao.find_(x, testObj);
      test(result.equals(testObj), "User with 'testObjDAO.read.*' permission can use 'find_' method.");
    } catch (Throwable t) {
      test(false, "User with 'testObj.read.*' permission using 'find_' method should not throw an exception.");
      t.printStackTrace();
    }
  }

  private void AuthenticatedDAO_ContextMethods_AuthorizedUser_put_create(X x) {
    // Create the decorated DAO to test.
    DAO testObjDAO = new MDAO(TestObj.getOwnClassInfo());
    ProxyDAO dao = new AuthenticatedDAO("testObj", testObjDAO);

    try {
      TestObj testObj = new TestObj.Builder(x).setId("123").build();
      TestObj result = (TestObj) dao.put_(x, testObj);
      test(result.equals(testObj), "User with 'testObjDAO.create' permission can use 'put_' method to create a new object.");
    } catch (Throwable t) {
      test(false, "User with 'testObj.create' permission using 'put_' method to create a new object should not throw an exception.");
      t.printStackTrace();
    }
  }

  private void AuthenticatedDAO_ContextMethods_AuthorizedUser_put_update(X x) {
    // Create the decorated DAO to test.
    DAO testObjDAO = new MDAO(TestObj.getOwnClassInfo());
    ProxyDAO dao = new AuthenticatedDAO("testObj", testObjDAO);

    // Create an object to try to update.
    TestObj testObj = new TestObj.Builder(x).setId("123").setDescription("Initial").build();
    testObjDAO.put(testObj);

    try {
      testObj.setDescription("Updated value");
      TestObj result = (TestObj) dao.put_(x, testObj);
      test(result.equals(testObj), "User with 'testObjDAO.update.*' permission can use 'put_' method to update an existing object.");
    } catch (Throwable t) {
      test(false, "User with 'testObj.update.*' permission using 'put_' method to update an existing object should not throw an exception.");
      t.printStackTrace();
    }
  }

  private void AuthenticatedDAO_ContextMethods_AuthorizedUser_remove(X x) {
    // Create the decorated DAO to test.
    DAO testObjDAO = new MDAO(TestObj.getOwnClassInfo());
    ProxyDAO dao = new AuthenticatedDAO("testObj", testObjDAO);

    // Create an object to try to remove.
    TestObj testObj = new TestObj.Builder(x).setId("123").build();
    testObjDAO.put(testObj);

    try {
      TestObj result = (TestObj) dao.remove_(x, testObj);
      test(result.equals(testObj), "User with 'testObj.remove.*' permission can use 'remove_' method to remove an existing object.");
      TestObj findResult = (TestObj) testObjDAO.find(testObj.getId());
      assert findResult == null;
    } catch (Throwable t) {
      test(false, "User with 'testObj.remove.*' permission using 'remove_' method to remove an existing object should not throw an exception.");
      t.printStackTrace();
    }
  }

  private void AuthenticatedDAO_ContextMethods_AuthorizedUser_removeAll(X x) {
    // Create the decorated DAO to test.
    DAO testObjDAO = new MDAO(TestObj.getOwnClassInfo());
    ProxyDAO dao = new AuthenticatedDAO("testObj", testObjDAO);

    // Create an object to try to remove.
    TestObj testObj = new TestObj.Builder(x).setId("123").build();
    testObjDAO.put(testObj);

    try {
      dao.removeAll_(x, 0, 1000, null, null);
      ArraySink sink = new ArraySink();
      testObjDAO.select(sink);
      List arr = sink.getArray();
      test(arr.size() == 0, "User with 'testObj.delete.* permission should be able to use 'removeAll_' method to remove all existing objects.");
    } catch (Throwable t) {
      test(false, "User with 'testObj.delete' permission using 'removeAll_' method to remove all existing objects should not throw an exception.");
      t.printStackTrace();
    }
  }

  private void AuthenticatedDAO_ContextMethods_AuthorizedUser_select(X x) {
    // Create the decorated DAO to test.
    DAO testObjDAO = new MDAO(TestObj.getOwnClassInfo());
    ProxyDAO dao = new AuthenticatedDAO("testObj", testObjDAO);

    // Create an object to try to select.
    TestObj testObj = new TestObj.Builder(x).setId("123").build();
    testObjDAO.put(testObj);

    try {
      ArraySink sink = new ArraySink();
      ArraySink result = (ArraySink) dao.select_(x, sink, 0, 1000, null, null);
      List arr = result.getArray();
      test(arr.size() == 1 && arr.get(0).equals(testObj), "User with 'testObjDAO.read.*' permission can use 'select_' method.");
    } catch (Throwable t) {
      test(false, "User with 'testObj.read.*' permission using 'select_' method should not throw an exception.");
      t.printStackTrace();
    }
  }
}
