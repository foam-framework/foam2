/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.auth;

import foam.core.X;
import foam.dao.DAO;
import foam.test.TestUtils;

public class PreventDuplicateEmailDAOTest
  extends foam.nanos.test.Test
{
  private DAO userDAO_;

  public void runTest(X x) {
    x = getTestingSubcontext(x);

    PreventsDuplicateEmail(x);
  }

  private X getTestingSubcontext(X x) {
    // Mock the userDAO and put a test user in it.
    x = TestUtils.mockDAO(x, "localUserDAO");
    userDAO_ = (DAO) x.get("localUserDAO");
    User testUser_ = TestUtils.createTestUser();
    userDAO_.put(testUser_);

    return x;
  }

  private void PreventsDuplicateEmail(X x) {
    User userWithDuplicateEmail = TestUtils.createTestUser();
    userWithDuplicateEmail.setId(2); // Make sure the id is different.
    DAO dao = new PreventDuplicateEmailDAO(x, userDAO_);
    test(
      TestUtils.testThrows(
        () -> dao.put_(x, userWithDuplicateEmail),
        "User with same email address already exists: " + userWithDuplicateEmail.getEmail(),
        RuntimeException.class
      ),
      "PreventDuplicateEmailDAO throws a RuntimeException with an appropriate message when a User is put with the same email as an existing user and a different id."
    );
  }
}
