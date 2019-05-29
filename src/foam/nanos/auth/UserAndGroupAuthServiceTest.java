package foam.nanos.auth;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.util.Password;

import javax.security.auth.AuthPermission;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;

public class UserAndGroupAuthServiceTest
  extends CachedUserAndGroupAuthService
{

  protected int numUsers        = 10;
  protected int numGroups       = 5;
  protected int numPermissions  = 10;

  protected ArrayList<X> xArray               = new ArrayList<>();
  protected ArrayList<User> userArray         = new ArrayList<>();
  protected ArrayList<Permission> permissions = new ArrayList<>();

  public UserAndGroupAuthServiceTest(X x) {
    super(x);
  }

  @Override
  public void start() throws java.lang.Exception {
    System.out.println("Starting");
    super.start();
    createGroupsAndPermissions();
    addTestUsers();
    testlogin();
    testCheck();
    testCachedCheck();
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

      group = (Group) ((DAO) getLocalGroupDAO()).put(group);
      for ( int j = 0 ; j < numPermissions ; j++ ) {
        foam.nanos.auth.Permission permission = new foam.nanos.auth.Permission();
        permission.setId(i + "" + j);
        permission.setDescription("Group" + i + " permissions-" + j);
        group.getPermissions(getX()).add(permission);
      }
    }

    long endTime                = System.nanoTime();
    long durationInMilliseconds = (endTime - startTime) / 1000000;
    System.out.println("Duration: " + durationInMilliseconds + "ms \n");
  }

  public void addTestUsers() {
    System.out.println("Registering " + numUsers + " Users");
    long startTime  = System.nanoTime();
    ArraySink sink   = (ArraySink) ((DAO) getLocalGroupDAO()).select(new ArraySink());

    /**
     * For each user, randomly select a group from the groups created
     * and assign the user to this group
     * */
    for ( int i = 0 ; i < numUsers ; i++ ) {
      User user = new User();
      user.setId(i);
      user.setEmail("marc" + i + "@nanopay.net");
      user.setFirstName("Marc" + i);
      user.setLastName("R" + i);
      user.setPassword(Password.hash("marc" + i));

      int randomGroup = ThreadLocalRandom.current().nextInt(0, sink.getArray().size());
      Group group = (Group) sink.getArray().get(randomGroup);

      user.setGroup(group.getId());
      ((DAO) getLocalUserDAO()).put(user);
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
        userArray.add(login(xArray.get(i), i, "marc" + i));
      } catch (AuthenticationException e) {
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
    ArraySink sink  = (ArraySink) ((DAO) getLocalGroupDAO()).select(new ArraySink());

    /**
     * For each user, we check if they have access to a random permission
     * We store these permissions in an array to test caching
     * */
    for ( int i = 0 ; i < xArray.size() ; i++ ) {
      int randomGroup = ThreadLocalRandom.current().nextInt(0, sink.getArray().size());
      Group group     = (Group) sink.getArray().get(randomGroup);

      List<Permission> groupPermissions = ((ArraySink) group.getPermissions(getX()).getDAO().select(new ArraySink())).getArray();
      int randomPermission  = ThreadLocalRandom.current().nextInt(0, groupPermissions.size());
      Permission permission = groupPermissions.get(randomPermission);
      permissions.add(permission);

      AuthPermission authAdminpermission = new AuthPermission(permission.getId());
      checkPermission(xArray.get(i), authAdminpermission);
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
      checkPermission(xArray.get(i), authAdminpermission);
    }

    long endTime                = System.nanoTime();
    long durationInMilliseconds = (endTime - startTime) / 1000000;
    System.out.println("Duration: " + durationInMilliseconds + "ms \n");
  }

  public void testUpdatePassword() {
    System.out.println("Update Password for " + numUsers + " Users");
    long startTime = System.nanoTime();

    for ( int i = 0 ; i < xArray.size() ; i++ ) {
      try {
        updatePassword(xArray.get(i), "marc" + i, "marcasdf");
      } catch (AuthenticationException e) {
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
