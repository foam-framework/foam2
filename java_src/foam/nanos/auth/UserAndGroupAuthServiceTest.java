package foam.nanos.auth;

import foam.core.X;
import javax.security.auth.AuthPermission;
import javax.security.auth.login.LoginException;
import java.util.ArrayList;
import java.util.concurrent.TimeUnit;
/**
 * Created by marcroopchand on 2017-05-24.
 */

public class UserAndGroupAuthServiceTest extends CachedUserAndGroupAuthService {
  private int numUsers = 1000000;
  private ArrayList<X> xArray = new ArrayList<>();
  private Group adminGroup = new Group();
  private Group memberGroup = new Group();

  @Override
  public void start() {
    super.start();
    createGroupsAndPermissions();
    addTestUsers();
    testlogin();
    testCheck();
    testCheck();
    testChallengedLogin();
    testUpdatePassword();
  }

  /**
   * Setup two groups and two different permissions for each group
   *  Admin
   *    - Admin Permission 1
   *    - Admin Permission 2
   *  Member
   *    - Member Permission 1
   *    - Member Permission 2
   * */
  public void createGroupsAndPermissions() {
    /**
     * Admin group with some permissions
     * */
    adminGroup.setId("1");
    adminGroup.setDescription("Admin Users");

    foam.nanos.auth.Permission adminPermission1 = new foam.nanos.auth.Permission();
    adminPermission1.setId("1");
    adminPermission1.setDescription("Admin permissions 1");

    foam.nanos.auth.Permission adminPermission2 = new foam.nanos.auth.Permission();
    adminPermission2.setId("2");
    adminPermission2.setDescription("Admin permissions 2");

    Permission[] adminPermissions = {adminPermission1, adminPermission2};
    adminGroup.setPermissions(adminPermissions);
    groupDAO_.put(adminGroup);

    /**
     * Memeber group with some permissions
     * */
    memberGroup.setId("2");
    memberGroup.setDescription("Member Users");

    foam.nanos.auth.Permission memberPermission1 = new foam.nanos.auth.Permission();
    memberPermission1.setId("3");
    memberPermission1.setDescription("Member permisssions 1");

    foam.nanos.auth.Permission memberPermission2 = new foam.nanos.auth.Permission();
    memberPermission2.setId("4");
    memberPermission2.setDescription("Member permisssion 2");

    Permission[] memberPermissions = {memberPermission1, memberPermission2};
    memberGroup.setPermissions(memberPermissions);
    groupDAO_.put(memberGroup);
  }

  public void addTestUsers() {
    System.out.println("Registering 1 million Users");
    long startTime = System.nanoTime();

    for (int i = 0; i < numUsers; i++) {
      User user = new User();
      user.setId("" + i);
      user.setEmail("marc" + i + "@nanopay.net");
      user.setFirstName("Marc" + i);
      user.setLastName("R" + i);
      user.setPassword("marc" + i);

      /**
       * Just set 3 users as admin for now, everyone
       * else will be members
       * */
      if (i == 5 || i == 15 || i == 20) {
        user.setGroup(adminGroup);
      }
      else {
        user.setGroup(memberGroup);
      }

      userDAO_.put(user);
    }

    long endTime = System.nanoTime();
    long durationInMilliseconds = (endTime - startTime) / 1000000;
    System.out.println("Duration: " + durationInMilliseconds + "ms \n");
  }

  public void testlogin() {
    System.out.println("Login 1 million Users");
    long startTime = System.nanoTime();

    for (int i = 0; i < numUsers; i++) {
      try {
        xArray.add(login("" + i, "marc" + i));
      }
      catch (LoginException e) {
        e.printStackTrace();
      }
    }

    long endTime = System.nanoTime();
    long durationInMilliseconds = (endTime - startTime) / 1000000;
    System.out.println("Duration: " + durationInMilliseconds + "ms \n");
  }

  public void testCheck() {
    System.out.println("Permissions Check for 1 million users");
    long startTime = System.nanoTime();

    /**
     * Go through all logged in users and check if a user has the permission above
     * */
    for (int i = 0; i < xArray.size(); i++) {
      AuthPermission authAdminpermission = new AuthPermission(adminGroup.getPermissions()[0].getId());
      check(xArray.get(i), authAdminpermission);
    }

    long endTime = System.nanoTime();
    long durationInMilliseconds = (endTime - startTime) / 1000000;
    System.out.println("Duration: " + durationInMilliseconds + "ms \n");
  }

  public void testChallengedLogin() {
    System.out.println("Challenge Login 1 million Users");
    long startTime = System.nanoTime();

    for (int i = 0; i < numUsers; i++) {
      try {
        challengedLogin("" + i, generateChallenge("" + i));
      }
      catch (LoginException e) {
        e.printStackTrace();
      }
    }

    long endTime = System.nanoTime();
    long durationInMilliseconds = (endTime - startTime) / 1000000;
    System.out.println("Duration: " + durationInMilliseconds + "ms \n");
  }

  public void testChallengedLoginWithExpiredChallenge() {
    try {
      String challenge = generateChallenge("0");
      TimeUnit.SECONDS.sleep(6);

      challengedLogin("0", challenge);
    }
    catch (LoginException e) {
      e.printStackTrace();
    }
    catch (InterruptedException e) {
      e.printStackTrace();
    }
  }

  public void testUpdatePassword() {
    System.out.println("Update Password for 1 million Users");
    long startTime = System.nanoTime();

    for (int i = 0; i < numUsers; i++) {
      try {
        X x = login("" + i, "marc" + i);
        updatePassword(x, "marc" + i, "marcasdf");
      }
      catch (LoginException e) {
        e.printStackTrace();
      }
    }

    long endTime = System.nanoTime();
    long durationInMilliseconds = (endTime - startTime) / 1000000;
    System.out.println("Duration: " + durationInMilliseconds + "ms \n");
  }

  public void testLogout() {
    try {
      X x = login("0", "marc0");
      logout(x);
    }
    catch (LoginException e) {
      e.printStackTrace();
    }
  }
}