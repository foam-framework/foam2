package foam.nanos.auth;

import foam.core.X;
import foam.dao.ListSink;
import javax.security.auth.AuthPermission;
import javax.security.auth.login.LoginException;
import java.util.ArrayList;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;
/**
 * Created by marcroopchand on 2017-05-24.
 */

public class UserAndGroupAuthServiceTest
  extends CachedUserAndGroupAuthService
{
  private int numUsers        = 100;
  private int numGroups       = 5;
  private int numPermissions  = 10;

  private ArrayList<X> xArray               = new ArrayList<>();
  private ArrayList<Permission> permissions = new ArrayList<>();

  @Override
  public void start() {
    super.start();
    createGroupsAndPermissions();
    addTestUsers();
    testlogin();
    testCheck();
    testCachedCheck();
    testChallengedLogin();
    testUpdatePassword();
    testLogout();
  }

  public void createGroupsAndPermissions() {
    System.out.println("Creating " + numGroups + " groups with " + numPermissions + " permissions each");
    long startTime = System.nanoTime();

    /**
     * Create numGroups and and add numPermissions to each group
     * */
    for ( int i = 0 ; i < numGroups ; i++ ) {
      Group group = new Group();
      group.setId("" + i);
      group.setDescription("Group " + i + " users");

      Permission[] permissions = new Permission[numPermissions];
      for ( int j = 0 ; j < numPermissions ; j++ ) {
        foam.nanos.auth.Permission permission = new foam.nanos.auth.Permission();
        permission.setId(i + "" + j);
        permission.setDescription("Group" + i + " permissions-" + j);
        permissions[j] = permission;
      }

      group.setPermissions(permissions);
      groupDAO_.put(group);
    }

    long endTime                = System.nanoTime();
    long durationInMilliseconds = (endTime - startTime) / 1000000;
    System.out.println("Duration: " + durationInMilliseconds + "ms \n");
  }

  public void addTestUsers() {
    System.out.println("Registering " + numUsers + " Users");
    long startTime  = System.nanoTime();
    ListSink sink   = (ListSink) groupDAO_.select(new ListSink());

    /**
     * For each user, randomly select a group from the groups created
     * and assign the user to this group
     * */
    for ( int i = 0 ; i < numUsers ; i++ ) {
      User user = new User();
      user.setId("" + i);
      user.setEmail("marc" + i + "@nanopay.net");
      user.setFirstName("Marc" + i);
      user.setLastName("R" + i);
      user.setPassword("marc" + i);

      int randomGroup = ThreadLocalRandom.current().nextInt(0, sink.getData().size());
      Group group = (Group) sink.getData().get(randomGroup);

      user.setGroup(group);
      userDAO_.put(user);
    }

    long endTime                = System.nanoTime();
    long durationInMilliseconds = (endTime - startTime) / 1000000;
    System.out.println("Duration: " + durationInMilliseconds + "ms \n");
  }

  public void testlogin() {
    System.out.println("Login " + numUsers + " Users");
    long startTime = System.nanoTime();

    /**
     * For each user, store the context into an array
     * This array will be used later for checking permissions for that user
     * */
    for ( int i = 0; i < numUsers; i++ ) {
      try {
        xArray.add(login("" + i, "marc" + i));
      } catch ( LoginException e ) {
        e.printStackTrace();
      }
    }

    long endTime                = System.nanoTime();
    long durationInMilliseconds = (endTime - startTime) / 1000000;
    System.out.println("Duration: " + durationInMilliseconds + "ms \n");
  }

  public void testCheck() {
    System.out.println("Permissions Check for " + numUsers + " users");
    long startTime = System.nanoTime();
    ListSink sink  = (ListSink) groupDAO_.select(new ListSink());

    /**
     * For each user, we check if they have access to a random permission
     * We store these permissions in an array to test caching
     * */
    for ( int i = 0 ; i < xArray.size() ; i++ ) {
      int randomGroup = ThreadLocalRandom.current().nextInt(0, sink.getData().size());
      Group group     = (Group) sink.getData().get(randomGroup);

      int randomPermission  = ThreadLocalRandom.current().nextInt(0, group.getPermissions().length);
      Permission permission = group.getPermissions()[randomPermission];
      permissions.add(permission);

      AuthPermission authAdminpermission = new AuthPermission(permission.getId());
      check(xArray.get(i), authAdminpermission);
    }
    long endTime                = System.nanoTime();
    long durationInMilliseconds = (endTime - startTime) / 1000000;
    System.out.println("Duration: " + durationInMilliseconds + "ms \n");
  }

  public void testCachedCheck() {
    System.out.println("Cached Permissions Check for " + numUsers + " users");
    long startTime = System.nanoTime();

    for ( int i = 0 ; i < xArray.size() ; i++ ) {
      AuthPermission authAdminpermission = new AuthPermission(permissions.get(i).getId());
      check(xArray.get(i), authAdminpermission);
    }

    long endTime                = System.nanoTime();
    long durationInMilliseconds = (endTime - startTime) / 1000000;
    System.out.println("Duration: " + durationInMilliseconds + "ms \n");
  }

  public void testChallengedLogin() {
    System.out.println("Challenge Login " + numUsers + " Users");
    long startTime = System.nanoTime();

    for ( int i = 0 ; i < numUsers ; i++ ) {
      try {
        challengedLogin("" + i, generateChallenge("" + i));
      } catch (LoginException e) {
        e.printStackTrace();
      }
    }

    long endTime                = System.nanoTime();
    long durationInMilliseconds = (endTime - startTime) / 1000000;
    System.out.println("Duration: " + durationInMilliseconds + "ms \n");
  }

  public void testChallengedLoginWithExpiredChallenge() {
    try {
      String challenge = generateChallenge("0");
      TimeUnit.SECONDS.sleep(6);
      challengedLogin("0", challenge);
    } catch (LoginException e) {
      e.printStackTrace();
    } catch (InterruptedException e) {
      e.printStackTrace();
    }
  }

  public void testUpdatePassword() {
    System.out.println("Update Password for " + numUsers + " Users");
    long startTime = System.nanoTime();

    for ( int i = 0 ; i < xArray.size() ; i++ ) {
      try {
        updatePassword(xArray.get(i), "marc" + i, "marcasdf");
      } catch (IllegalStateException e) {
        e.printStackTrace();
      }
    }

    long endTime                = System.nanoTime();
    long durationInMilliseconds = (endTime - startTime) / 1000000;
    System.out.println("Duration: " + durationInMilliseconds + "ms \n");
  }

  public void testLogout() {
    System.out.println("Logout " + numUsers + " Users");
    long startTime = System.nanoTime();

    for ( int i = 0; i < xArray.size(); i++ ) {
      logout(xArray.get(i));
    }

    long endTime                = System.nanoTime();
    long durationInMilliseconds = (endTime - startTime) / 1000000;
    System.out.println("Duration: " + durationInMilliseconds + "ms \n");
  }
}
