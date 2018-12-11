package foam.nanos.auth;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.MDAO;
import foam.test.TestUtils;
import foam.util.Auth;
import foam.util.SafetyUtil;

public class UserAuthorizationTest extends foam.nanos.test.Test {
  @Override
  public void runTest(X x) {

    // create mock localUserDAO
    x = x.put("localUserDAO", new MDAO(User.getOwnClassInfo()));
    DAO localUserDAO = (DAO) x.get("localUserDAO");

    // need to start auth service
    UserAndGroupAuthService newAuthService = new UserAndGroupAuthService(x);
    newAuthService.start();
    x = x.put("auth", newAuthService);

    // create mock userDAO
    DAO tempDAO = new AuthorizationDAO(x, (DAO) x.get("localUserDAO"));
    x = x.put("userDAO", tempDAO);

    // create an admin User
    User adminUser = new User();
    adminUser.setId(999);
    adminUser.setFirstName("Tester");
    adminUser.setLastName("Nanopay");
    adminUser.setEmail("testerA@nanopay.net");
    adminUser.setGroup("admin");
    X adminContext = Auth.sudo(x, adminUser);

    // create a non-admin user
    User nonAdminUser = new User();
    nonAdminUser.setId(666);
    nonAdminUser.setFirstName("Tester2");
    nonAdminUser.setLastName("Nanopay2");
    nonAdminUser.setEmail("testerB@nanopay.net");
    nonAdminUser.setGroup("system");
    X nonAdminContext = Auth.sudo(x, nonAdminUser);

    // create a old user
    User oldUser = new User();
    oldUser.setId(2000);
    oldUser.setFirstName("Old");
    oldUser.setLastName("User");
    oldUser.setEmail("old@nanopay.net");
    oldUser.setGroup("basicUser");
    oldUser.setSystem(true);


    localUserDAO.put_(x, adminUser);
    localUserDAO.put_(x, nonAdminUser);
    localUserDAO.put_(x, oldUser);


    //test case
    AdminUpdateSystemFlag(adminContext);
    AdminCreateUserWithSystemFlag(adminContext);
    NonAdminUpdateSystemFlag(nonAdminContext);
    NonAdminCreateUserWithSystemFlag(nonAdminContext);
  }

  public void AdminUpdateSystemFlag(X adminContext) {
    // get old user
    DAO  userDAO =   (DAO) adminContext.get("userDAO");
    User oldUser =   (User) userDAO.find_(adminContext, 2000);

    // get new user and update the system flag
    User newUser = (User) SafetyUtil.deepClone(oldUser);
    newUser.setSystem(!oldUser.getSystem());

    userDAO.put_(adminContext, newUser);

    test( ( (User) userDAO.find_(adminContext, newUser.getId()) ).getSystem() != oldUser.getSystem() ,
      "Admin User update the user's system flag.");
  }

  public void AdminCreateUserWithSystemFlag(X adminContext) {
    // create new user
    User newUser = new User();
    newUser.setId(2001);
    newUser.setFirstName("New");
    newUser.setLastName("User");
    newUser.setEmail("new@nanopay.net");
    newUser.setGroup("basicUser");
    newUser.setSystem(true);

    // get user dao
    DAO userDAO = (DAO) adminContext.get("userDAO");

    userDAO.put_(adminContext, newUser);

    test( ((User)userDAO.find_(adminContext, 2001)).getSystem() ,
      "Admin User create a user with system flag.");
  }

  public void NonAdminUpdateSystemFlag(X nonAdminContext) {
    // get old user
    DAO userDAO = (DAO) nonAdminContext.get("userDAO");
    User oldUser = (User) userDAO.find_(nonAdminContext, 2000);

    // get new user and update the system flag
    User newUser = (User) SafetyUtil.deepClone(oldUser);
    newUser.setSystem(!oldUser.getSystem());

    test(
      TestUtils.testThrows(
        () -> userDAO.put_(nonAdminContext, newUser),
        "You do not have permission to change the 'system' flag.",
        AuthorizationException.class
      ),
      "Non admin user update the user's system flag."
    );
  }

  public void NonAdminCreateUserWithSystemFlag(X nonAdminContext) {
    // create new user
    User newUser = new User();
    newUser.setId(2002);
    newUser.setFirstName("New");
    newUser.setLastName("User");
    newUser.setEmail("new@nanopay.net");
    newUser.setGroup("basicUser");
    newUser.setSystem(true);

    // get user dao
    DAO userDAO = (DAO) nonAdminContext.get("userDAO");

    test(
      TestUtils.testThrows(
        () -> userDAO.put_(nonAdminContext, newUser),
        "You do not have permission to change the 'system' flag.",
        AuthorizationException.class
      ),
      "Non admin user create a user with system flag."
    );
  }

}
