/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.auth;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.dao.*;
import foam.mlang.MLang;
import foam.nanos.NanoService;
import foam.util.Email;
import foam.util.Password;
import foam.util.LRULinkedHashMap;

import javax.naming.AuthenticationException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.*;
import java.util.regex.Pattern;

public class UserAndGroupAuthService
    extends    ContextAwareSupport
    implements AuthService, NanoService
{
  protected static final ThreadLocal<StringBuilder> sb = new ThreadLocal<StringBuilder>() {
    @Override
    protected StringBuilder initialValue() {
      return new StringBuilder();
    }

    @Override
    public StringBuilder get() {
      StringBuilder b = super.get();
      b.setLength(0);
      return b;
    }
  };

  protected DAO userDAO_;
  protected DAO groupDAO_;
  protected Map challengeMap;
  public static final String HASH_METHOD = "SHA-512";

  @Override
  public void start() {
    userDAO_      = (DAO) getX().get("localUserDAO");
    groupDAO_     = (DAO) getX().get("groupDAO");
    challengeMap  = new LRULinkedHashMap<Long, Challenge>(20000);
  }

  public User getCurrentUser(X x) {
    return (User) x.get("user");
  }

  /**
   * A challenge is generated from the userID provided
   * This is saved in a LinkedHashMap with ttl of 5
   */
  public String generateChallenge(long userId) throws AuthenticationException {
    if ( userId < 1 ) {
      throw new AuthenticationException("Invalid User Id");
    }

    if ( userDAO_.find(userId) == null ) {
      throw new AuthenticationException("User not found");
    }

    String   generatedChallenge = UUID.randomUUID() + String.valueOf(userId);
    Calendar calendar           = Calendar.getInstance();
    calendar.add(Calendar.SECOND, 5);

    challengeMap.put(userId, new Challenge(generatedChallenge, calendar.getTime()));
    return generatedChallenge;
  }

  /**
   * Checks the LinkedHashMap to see if the the challenge supplied is correct
   * and the ttl is still valid
   *
   * How often should we purge this map for challenges that have expired?
   */
  public User challengedLogin(long userId, String challenge) throws AuthenticationException {
    if ( userId < 1 || "".equals(challenge) ) {
      throw new AuthenticationException("Invalid Parameters");
    }

    Challenge c = (Challenge) challengeMap.get(userId);
    if ( c == null ) throw new AuthenticationException("Invalid userId");

    if ( ! c.getChallenge().equals(challenge) ) {
      throw new AuthenticationException("Invalid Challenge");
    }

    if ( new Date().after(c.getTtl()) ) {
      challengeMap.remove(userId);
      throw new AuthenticationException("Challenge expired");
    }

    User user = (User) userDAO_.find(userId);
    if ( user == null ) throw new AuthenticationException("User not found");

    challengeMap.remove(userId);
    getX().put("user", user);
    return user;
  }

  /**
   * Login a user by the id provided, validate the password
   * and return the user in the context.
   */
  public User login(long userId, String password) throws AuthenticationException {
    if ( userId < 1 || "".equals(password) ) {
      throw new AuthenticationException("Invalid Parameters");
    }

    User user = (User) userDAO_.find(userId);
    if ( user == null ) {
      throw new AuthenticationException("User not found.");
    }

    if ( ! Password.verify(password, user.getPassword()) ) {
      throw new AuthenticationException("Invalid Password");
    }

    getX().put("user", user);
    return user;
  }

  public User loginByEmail(String email, String password) throws AuthenticationException {
    if ( "".equals(email) || ! Email.isValid(email) ) {
      throw new AuthenticationException("Invalid email");
    }

    if ( "".equals(password) || ! Password.isValid(password) ) {
      throw new AuthenticationException("Invalid password");
    }
    
    Sink sink = new ListSink();
    sink = userDAO_.where(MLang.EQ(User.EMAIL, email.toLowerCase())).limit(1).select(sink);

    List data = ((ListSink) sink).getData();
    if ( data == null || data.size() != 1 ) {
      throw new AuthenticationException("User not found");
    }

    User user = (User) data.get(0);
    if ( user == null ) {
      throw new AuthenticationException("User not found");
    }

    if ( ! Password.verify(password, user.getPassword()) ) {
      throw new AuthenticationException("Invalid password");
    }

    getX().put("user", user);
    return user;
  }

  /**
   * Check if the user in the context supplied has the right permission
   * Return Boolean for this
   */
  public Boolean check(foam.core.X x, java.security.Permission permission) {
    if ( x == null || permission == null ) return false;

    User user = (User) x.get("user");
    if ( user == null ) return false;

    Group group = (Group) user.getGroup();
    if ( group == null ) return false;

    if ( userDAO_.find_(x, user.getId()) == null ) {
      return false;
    }

    return group.implies(permission);
  }

  /**
   * Given a context with a user, validate the password to be updated
   * and return a context with the updated user information
   */
  public X updatePassword(foam.core.X x, String oldPassword, String newPassword)
      throws AuthenticationException {

    if ( x == null || "".equals(oldPassword) || "".equals(newPassword) ) {
      throw new AuthenticationException("Invalid Parameters");
    }

    User user = (User) userDAO_.find_(x, ((User) x.get("user")).getId());
    if ( user == null ) {
      throw new AuthenticationException("User not found");
    }

    // old password does not match
    if ( ! Password.verify(oldPassword, user.getPassword()) ) {
      throw new AuthenticationException("Invalid password");
    }

    // new password is the same
    if ( Password.verify(newPassword, user.getPassword()) ) {
      throw new AuthenticationException("New password must be different");
    }

    // store new password in DAO and put in context
    String hash = Password.hash(newPassword);
    user.setPassword(newPassword);
    user = (User) userDAO_.put(user);
    return this.getX().put("user", user);
  }

  /**
   * Used to validate properties of a user. This will be called on registration of users
   * Will mainly be used as a veto method.
   * Users should have id, email, first name, last name, password for registration
   */
  public void validateUser(User user) throws AuthenticationException {
    if ( user == null ) {
      throw new AuthenticationException("Invalid User");
    }

    if ( "".equals(user.getEmail()) ) {
      throw new AuthenticationException("Email is required for creating a user");
    }

    if ( ! Email.isValid(user.getEmail()) ) {
      throw new AuthenticationException("Email format is invalid");
    }

    if ( "".equals(user.getFirstName()) ) {
      throw new AuthenticationException("First Name is required for creating a user");
    }

    if ( "".equals(user.getLastName()) ) {
      throw new AuthenticationException("Last Name is required for creating a user");
    }

    if ( "".equals(user.getPassword()) ) {
      throw new AuthenticationException("Password is required for creating a user");
    }

    if ( ! Password.isValid(user.getPassword()) ) {
      throw new AuthenticationException("Password needs to minimum 8 characters, contain at least one uppercase, one lowercase and a number");
    }
  }

  /**
   * Just return a null user for now. Not sure how to handle the cleanup
   * of the current context
   */
  public void logout(X x) {}
}
