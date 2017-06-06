package foam.nanos.auth;

import foam.core.X;
import foam.dao.RelationshipPropertyValue;
import javax.security.auth.login.LoginException;
import java.util.concurrent.TimeUnit;

/**
 * Created by marcroopchand on 2017-05-24.
 */
public class UserAndGroupAuthServiceTest extends UserAndGroupAuthService {
  @Override
  public void start() {
    super.start();
    addTestUsers();
    testlogin();
    testChallengedLogin();
    testUpdatePassword();
  }

  public void addTestUsers() {
    System.out.println("Adding 1 million Users");
    long startTime = System.nanoTime();

    for (int i = 0; i < 1000000; i++) {
      User user = new User();
      user.setId("" + i);
      user.setEmail("marc" + i + "@nanopay.net");
      user.setFirstName("Marc" + i);
      user.setLastName("R" + i);
      user.setPassword("marc" + i);
      userDAO_.put(user);
    }

    long endTime = System.nanoTime();
    long durationInMilliseconds = (endTime - startTime) / 1000000;
    System.out.println("Duration: " + durationInMilliseconds + "ms \n");
  }

  public void testlogin() {
    System.out.println("Login 1 million Users");
    long startTime = System.nanoTime();

    for (int i = 0; i < 1000000; i++) {
      try {
        X test = login("" + i, "marc" + i);
        User user = (User) test.get("user");
      } catch (LoginException e) {
        e.printStackTrace();
      }
    }

    long endTime = System.nanoTime();
    long durationInMilliseconds = (endTime - startTime) / 1000000;
    System.out.println("Duration: " + durationInMilliseconds + "ms \n");
  }

  public void testChallengedLogin() {
    System.out.println("Challenge Login 1 million Users");
    long startTime = System.nanoTime();

    for (int i = 0; i < 1000000; i++) {
      try {
        String challenge = generateChallenge("" + i);
        X test = challengedLogin("" + i, challenge);
        User user = (User) test.get("user");
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

    for (int i = 0; i < 1000000; i++) {
      try {
        X test = login("" + i, "marc" + i);

        X newX = updatePassword(test, "marc" + i, "marcasdf");
        User user = (User) newX.get("user");
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
      X test = login("0", "marc0");

      X newX = updatePassword(test, "marc0", "marc55");
      User user = (User) newX.get("user");
      System.out.println(user.getPassword());
    } catch (LoginException e) {
      e.printStackTrace();
    }
  }
}
