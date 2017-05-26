package foam.nanos.auth;

import foam.core.ContextAwareSupport;
import foam.core.X;
import javax.security.auth.login.LoginException;
import java.util.Calendar;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.UUID;
import foam.dao.*;

/**
 * Created by marcroopchand on 2017-05-12.
 */
public class UserAndGroupAuthService extends ContextAwareSupport implements AuthService {
  protected MapDAO userDAO_;
  protected MapDAO groupDAO_;
  protected LinkedHashMap challengeMap;

  @Override
  public void start() {
    userDAO_ = (MapDAO) getX().get("userDAO");
    groupDAO_ = (MapDAO) getX().get("groupDAO");

    //TODO: Implement LRU LinkedHashMap
    challengeMap = new LinkedHashMap<String, Challenge>(20000);
  }

  /**
   * A challenge is generated from the userID provided
   * This is saved in a LinkedHashMap with ttl of 5
   * <p>
   * Should this throw an exception?
   */
  public String generateChallenge(String userId) {
    if (userId == null || userId == "") {
      return null;
    }

    if (userDAO_.find(userId) == null) {
      return null;
    }

    String generatedChallenge = UUID.randomUUID() + userId;
    Calendar calendar = Calendar.getInstance();
    calendar.add(Calendar.SECOND, 5);

    challengeMap.put(userId, new Challenge(generatedChallenge, calendar.getTime()));

    return generatedChallenge;
  }

  /**
   * Checks the LinkedHashMap to see if the the challenge supplied is correct
   * and the ttl is still valid
   * <p>
   * How often should we purge this map for challenges that have expired?
   */
  public X challengedLogin(String userId, String challenge) throws LoginException {
    if (userId == null || challenge == null || userId == "" || challenge == "") {
      throw new LoginException("Invalid Parameters");
    }

    Challenge c = (Challenge) challengeMap.get(userId);
    if (c == null) {
      throw new LoginException("Invalid userId");
    }

    if (!c.getChallenge().equals(challenge)) {
      throw new LoginException("Invalid Challenge");
    }

    if (new Date().after(c.getTtl())) {
      challengeMap.remove(userId);
      throw new LoginException("Challenge expired");
    }

    User user = (User) userDAO_.find(userId);
    if (user == null) {
      throw new LoginException("User not found");
    }

    challengeMap.remove(userId);
    return this.getX().put("user", user);
  }

  /**
   * Login a user by the id provided, validate the password
   * and return the user in the context.
   */
  public X login(String userId, String password) throws LoginException {
    if (userId == null || password == null || userId == "" || password == "") {
      throw new LoginException("Invalid Parameters");
    }

    User user = (User) userDAO_.find(userId);

    if (user == null) {
      throw new LoginException("User not found.");
    }

    if (!user.getPassword().equals(password)) {
      throw new LoginException("Invalid Password");
    }

    return this.getX().put("user", user);
  }

  /**
   * Check if the user in the context supplied has the right permission
   * Return Boolean for this
   */
  public Boolean check(foam.core.X x, java.security.Permission permission) {
    if (x == null || permission == null) {
      return false;
    }

    User user = (User) x.get("user");
    if (user == null) {
      return false;
    }

    if (userDAO_.find(user.getId()) == null) {
      return false;
    }

    //TODO: Figure out how permissions work
    return true;
  }

  /**
   * Given a context with a user, validate the password to be updated
   * and return a context with the updated user information
   */
  public X updatePassword(foam.core.X x, String oldPassword, String newPassword) throws IllegalStateException {
    if (x == null || oldPassword == null || newPassword == null || oldPassword == "" || newPassword == "") {
      throw new IllegalStateException("Invalid Parameters");
    }

    if (oldPassword == newPassword) {
      throw new IllegalStateException("New Password must be different from the old password");
    }

    User user = (User) userDAO_.find(((User) x.get("user")).getId());
    if (user == null) {
      throw new IllegalStateException("User not found");
    }

    if (!oldPassword.equals(user.getPassword())) {
      throw new IllegalStateException("Invalid Password");
    }

    userDAO_.put(user.setPassword(newPassword));

    return this.getX().put("user", user);
  }

  /**
   * Used to validate properties of a user. This will be called on registration of users
   * Will mainly be used as a veto method.
   * Users should have id, email, first name, last name, password for registration
   */
  public Boolean validateUser(User user) throws IllegalStateException {
    if (user == null) {
      throw new IllegalStateException("Invalid User");
    }

    if (user.getId() == "") {
      throw new IllegalStateException("ID is required for creating a user");
    }

    if (user.getEmail() == "") {
      throw new IllegalStateException("Email is required for creating a user");
    }

    if (user.getFirstName() == "") {
      throw new IllegalStateException("First Name is required for creating a user");
    }

    if (user.getLastName() == "") {
      throw new IllegalStateException("Last Name is required for creating a user");
    }

    if (user.getPassword() == "") {
      throw new IllegalStateException("Password is required for creating a user");
    }

    return true;
  }

  /**
   * Just return a null user for now. Not sure how to handle the cleanup
   * of the current context
   */
  public X logout(X x) {
    return this.getX().put("user", null);
  }
}