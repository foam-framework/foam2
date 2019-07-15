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

import java.util.ArrayList;
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
    testUser_ = (User) userDAO_.put(testUser_).fclone();
    X basicUserContext = Auth.sudo(x, testUser_);

    AuthenticatedDAO_ContextMethods_UnauthorizedUser_find(basicUserContext);
    AuthenticatedDAO_ContextMethods_UnauthorizedUser_put(basicUserContext);
    AuthenticatedDAO_ContextMethods_UnauthorizedUser_remove(basicUserContext);
    AuthenticatedDAO_ContextMethods_UnauthorizedUser_removeAll(basicUserContext);
    AuthenticatedDAO_ContextMethods_UnauthorizedUser_select(basicUserContext);

    // Set the test user to be part of a user group with all permissions.
    testUser_.setGroup(adminGroup_.getId());
    testUser_ = (User) userDAO_.put(testUser_).fclone();
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
    testUser_ = (User) userDAO_.put(TestUtils.createTestUser()).fclone();

    // Mock the groupDAO and localGroupDAO.
    x = TestUtils.mockDAO(x, "localGroupDAO");
    DAO groupDAO = (DAO) x.get("localGroupDAO");
    x = x.put("groupDAO", groupDAO);

    // Mock the groupPermissionJunctionDAO.
    x = TestUtils.mockDAO(x, "groupPermissionJunctionDAO");
    DAO groupPermissionJunctionDAO = (DAO) x.get("groupPermissionJunctionDAO");

    // Mock the permissionDAO.
    x = TestUtils.mockDAO(x, "localPermissionDAO");
    DAO permissionDAO = (DAO) x.get("localPermissionDAO");

    List<Permission> adminPermissions = new ArrayList<>();
    adminPermissions.add(new Permission.Builder(x).setId("testObj.read.*").build());
    adminPermissions.add(new Permission.Builder(x).setId("testObj.create").build());
    adminPermissions.add(new Permission.Builder(x).setId("testObj.update.*").build());
    adminPermissions.add(new Permission.Builder(x).setId("testObj.remove.*").build());
    adminPermissions.add(new Permission.Builder(x).setId("testObj.delete.*").build());

    // Put a group in the groupDAO with permission to read, update, and delete the testObjDAO.
    adminGroup_ = new Group();
    adminGroup_.setId("admin");
    adminGroup_.setEnabled(true);

    groupDAO.put(adminGroup_);

    for ( Permission p : adminPermissions ) {
      permissionDAO.put(p);
      adminGroup_.getPermissions(x).add(p);
    }

    basicUserGroup_ = new Group();
    basicUserGroup_.setId("basic");
    basicUserGroup_.setEnabled(true);

    List<Permission> basicPermissions = new ArrayList<>();
    basicPermissions.add(new Permission.Builder(x).setId("testObj.read.public").build());
    basicPermissions.add(new Permission.Builder(x).setId("testObj.remove.public").build());
    basicPermissions.add(new Permission.Builder(x).setId("testObj.delete.public").build());

    groupDAO.put(basicUserGroup_);

    for ( Permission p : basicPermissions ) {
      permissionDAO.put(p);
      basicUserGroup_.getPermissions(x).add(p);
    }

    // Mock the AuthService.
    UserAndGroupAuthService auth = new UserAndGroupAuthService(x);
    try {
      auth.start();
    } catch ( Throwable t ) {
      test(false, "User and group auth service shouldn't be throwing exceptions.");
    }
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
        AuthorizationException.class
      ),
      "Should throw 'AuthorizationException' with appropriate message when a user tries to 'find' from the DAO."
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
        AuthorizationException.class
      ),
      "Should throw 'AuthorizationException' with appropriate message when a user tries to 'put' to the DAO."
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
        AuthorizationException.class
      ),
      "Should throw 'AuthorizationException' with appropriate message when a user tries to 'remove' from the DAO."
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
        AuthorizationException.class
      ),
      "Should throw 'AuthorizationException' with appropriate message when a user tries to 'removeAll' from the DAO."
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
        AuthorizationException.class
      ),
      "Should throw 'AuthorizationException' with appropriate message when a user tries to 'select' from the DAO."
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
        "Permission denied.",
        AuthorizationException.class
      ),
      "Should throw 'AuthorizationException' with appropriate message when an unauthenticated user tries to 'find_' from the DAO."
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
        "Permission denied.",
        AuthorizationException.class
      ),
      "Should throw 'AuthorizationException' with appropriate message when an unauthenticated user tries to 'put_' to the DAO."
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
        "Permission denied.",
        AuthorizationException.class
      ),
      "Should throw 'AuthorizationException' with appropriate message when an unauthenticated user tries to 'remove_' from the DAO."
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
