package foam.nanos.auth;

import foam.core.X;
import foam.dao.ListSink;
import foam.mlang.MLang;

import javax.security.auth.AuthPermission;
import javax.security.auth.login.LoginException;
import java.util.ArrayList;
import java.util.concurrent.TimeUnit;
/**
 * Created by marcroopchand on 2017-05-24.
 */

public class UserAndGroupAuthServiceTest extends UserAndGroupAuthService {
  private int numUsers = 30;
  private ArrayList<X> xArray = new ArrayList<>();

  @Override
  public void start() {
    super.start();
    addTestUsersAndGroups();
    testlogin();
    testCheck();
//    testChallengedLogin();
//    testUpdatePassword();
  }

  public void addTestUsersAndGroups() {

    /**
     * Setup two groups and two different permissions for each group
     *  Admin
     *    - Admin Permission 1
     *    - Admin Permission 2
     *  Member
     *    - Member Permission 1
     *    - Member Permission 2
     * */
    Group adminGroup = new Group();
    adminGroup.setId("1");
    adminGroup.setDescription("Admin Users");

    foam.nanos.auth.Permission adminPermission1 = new foam.nanos.auth.Permission();
    adminPermission1.setId("1");
    adminPermission1.setDescription("Admin permissions 1");
    adminGroup.addPermission(adminPermission1);

    foam.nanos.auth.Permission adminPermission2 = new foam.nanos.auth.Permission();
    adminPermission2.setId("2");
    adminPermission2.setDescription("Admin permissions 2");
    adminGroup.addPermission(adminPermission2);
    groupDAO_.put(adminGroup);

    Group memberGroup = new Group();
    memberGroup.setId("2");
    memberGroup.setDescription("Member Users");

    foam.nanos.auth.Permission memberPermission1 = new foam.nanos.auth.Permission();
    memberPermission1.setId("3");
    memberPermission1.setDescription("Member permisssions 1");
    memberGroup.addPermission(memberPermission1);

    foam.nanos.auth.Permission memberPermission2 = new foam.nanos.auth.Permission();
    memberPermission2.setId("4");
    memberPermission2.setDescription("Member permisssion 2");
    memberGroup.addPermission(memberPermission2);
    groupDAO_.put(memberGroup);

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
        X x = login("" + i, "marc" + i);
        xArray.add(x);
      } catch (LoginException e) {
        e.printStackTrace();
      }
    }

    long endTime = System.nanoTime();
    long durationInMilliseconds = (endTime - startTime) / 1000000;
    System.out.println("Duration: " + durationInMilliseconds + "ms \n");
  }

  public void testCheck() {
    /**
     * Get a group from the groupDAO
     * From that group get a permission
     * */
    ListSink sink = (ListSink) groupDAO_.where(MLang.EQ(Group.ID, "2")).select(new ListSink(), null, null, null, null);
    Group group = (Group) sink.getData().get(0);
    ArrayList<Permission> permissions = group.getPermissions();

    /**
     * Go through all logged in users and check if a user has the permission above
     * */
    for (int i = 0; i < xArray.size(); i++) {
      AuthPermission authAdminpermission = new AuthPermission(permissions.get(0).getId());
      System.out.println(check(xArray.get(i), authAdminpermission));
    }
  }

  public void testChallengedLogin() {
    System.out.println("Challenge Login 1 million Users");
    long startTime = System.nanoTime();

    for (int i = 0; i < numUsers; i++) {
      try {
        String challenge = generateChallenge("" + i);
        X x = challengedLogin("" + i, challenge);
      } catch (LoginException e) {
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

      X test = challengedLogin("0", challenge);
      User user = (User) test.get("user");
    } catch (LoginException e) {
      e.printStackTrace();
    } catch (InterruptedException e) {
      e.printStackTrace();
    }
  }

  public void testUpdatePassword() {
    System.out.println("Update Password for 1 million Users");
    long startTime = System.nanoTime();

    for (int i = 0; i < numUsers; i++) {
      try {
        X x = login("" + i, "marc" + i);
        X udpatedX = updatePassword(x, "marc" + i, "marcasdf");
      } catch (LoginException e) {
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
      X udpatedX = updatePassword(x, "marc0", "marc55");
    } catch (LoginException e) {
      e.printStackTrace();
    }
  }

  /**
   * This is just the implementation for Groups
   * Just saving this here for now until I learn how to generate it
   * from the model
   *
   private ArrayList<Permission> permissions_ = new ArrayList<>();
   public void addPermission(Permission permission) {
   permissions_.add(permission);
   }

   public void removePermissions(Permission permission) {
   permissions_.remove(permission);
   }

   public ArrayList<Permission> getPermissions() {
   return permissions_;
   }

   public Boolean implies(String name) {
   for (int i = 0; i < permissions_.size(); i++) {
   if (permissions_.get(i).getId().equals(name)) {
   return true;
   }
   }

   return false;
   }
   *
   *
   * */


}