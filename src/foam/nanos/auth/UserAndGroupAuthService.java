/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.auth;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ArraySink;
import foam.dao.Sink;
import foam.mlang.MLang;
import foam.nanos.NanoService;
import foam.nanos.session.Session;
import foam.util.Email;
import foam.util.LRULinkedHashMap;
import foam.util.Password;
import foam.util.SafetyUtil;
import java.security.Permission;
import java.util.*;
import javax.naming.AuthenticationException;
import javax.security.auth.AuthPermission;

public class UserAndGroupAuthService
  extends    ContextAwareSupport
  implements AuthService, NanoService
{
  protected DAO userDAO_;
  protected DAO groupDAO_;
  protected DAO sessionDAO_;

  // pattern used to check if password has only alphanumeric characters
  java.util.regex.Pattern alphanumeric = java.util.regex.Pattern.compile("[^a-zA-Z0-9]");

  public UserAndGroupAuthService(X x) {
    setX(x);
  }

  @Override
  public void start() {
    userDAO_     = (DAO) getX().get("localUserDAO");
    groupDAO_    = (DAO) getX().get("groupDAO");
    sessionDAO_  = (DAO) getX().get("sessionDAO");
  }

  public User getCurrentUser(X x) throws AuthenticationException {
    // fetch context and check if not null or user id is 0
    Session session = x.get(Session.class);
    if ( session == null || session.getUserId() == 0 ) {
      throw new AuthenticationException("Not logged in");
    }

    // get user from session id
    User user = (User) userDAO_.find(session.getUserId());
    if ( user == null ) {
      throw new AuthenticationException("User not found: " + session.getUserId());
    }

    if ( ! user.getEnabled() ) {
      throw new AuthenticationException("User disabled");
    }

    return user;
  }

  /**
   * A challenge is generated from the userID provided
   * This is saved in a LinkedHashMap with ttl of 5
   */
  public String generateChallenge(long userId) throws AuthenticationException {
    throw new UnsupportedOperationException("Unsupported operation: generateChallenge");
  }

  /**
   * Checks the LinkedHashMap to see if the the challenge supplied is correct
   * and the ttl is still valid
   *
   * How often should we purge this map for challenges that have expired?
   */
  public User challengedLogin(X x, long userId, String challenge) throws AuthenticationException {
    throw new UnsupportedOperationException("Unsupported operation: challengedLogin");
  }

  /**
   * Login a user by the id provided, validate the password
   * and return the user in the context.
   */
  public User login(X x, long userId, String password) throws AuthenticationException {
    if ( userId < 1 || SafetyUtil.isEmpty(password) ) {
      throw new AuthenticationException("Invalid Parameters");
    }

    User user = (User) userDAO_.find(userId);
    if ( user == null ) {
      throw new AuthenticationException("User not found.");
    }

    if ( ! user.getEnabled() ) {
      throw new AuthenticationException("User disabled");
    }

    if ( ! Password.verify(password, user.getPassword()) ) {
      throw new AuthenticationException("Invalid Password");
    }

    Session session = x.get(Session.class);
    session.setUserId(user.getId());
    session.setContext(session.getContext().put("user", user));
    sessionDAO_.put(session);
    return user;
  }

  public User loginByEmail(X x, String email, String password) throws AuthenticationException {
    Sink sink = new ArraySink();
    sink = userDAO_.where(MLang.EQ(User.EMAIL, email.toLowerCase())).limit(1).select(sink);

    List data = ((ArraySink) sink).getArray();
    if ( data == null || data.size() != 1 ) {
      throw new AuthenticationException("User not found");
    }

    User user = (User) data.get(0);
    if ( user == null ) {
      throw new AuthenticationException("User not found");
    }

    if ( ! user.getEnabled() ) {
      throw new AuthenticationException("User disabled");
    }

    if ( ! Password.verify(password, user.getPassword()) ) {
      throw new AuthenticationException("Incorrect password");
    }

    Session session = x.get(Session.class);
    session.setUserId(user.getId());
    session.setContext(session.getContext().put("user", user));
    sessionDAO_.put(session);
    return user;
  }

  /**
   * Check if the user in the context supplied has the right permission
   * Return Boolean for this
   */
  public Boolean checkPermission(foam.core.X x, Permission permission) {
    if ( x == null || permission == null ) {
      return false;
    }

    Session session = x.get(Session.class);
    if ( session == null || session.getUserId() == 0 ) {
      return false;
    }

    User user = (User) userDAO_.find(session.getUserId());
    if ( user == null || ! user.getEnabled() ) {
      return false;
    }

    try {
      String groupId = (String) user.getGroup();

      while ( ! SafetyUtil.isEmpty(groupId) ) {
        Group group = (Group) groupDAO_.find(groupId);

        if ( group == null ) break;

        if ( group.implies(permission) ) return true;
        groupId = group.getParent();
      }
    } catch (Throwable t) {
    }

    return false;
  }

  public Boolean check(foam.core.X x, String permission) {
    return checkPermission(x, new AuthPermission(permission));
  }

  /**
   * Given a context with a user, validate the password to be updated
   * and return a context with the updated user information
   */
  public User updatePassword(foam.core.X x, String oldPassword, String newPassword) throws AuthenticationException {
    if ( x == null || SafetyUtil.isEmpty(oldPassword) || SafetyUtil.isEmpty(newPassword) ) {
      throw new RuntimeException("Invalid parameters");
    }

    Session session = x.get(Session.class);
    if ( session == null || session.getUserId() == 0 ) {
      throw new AuthenticationException("User not found");
    }

    User user = (User) userDAO_.find(session.getUserId());
    if ( user == null ) {
      throw new AuthenticationException("User not found");
    }

    if ( ! user.getEnabled() ) {
      throw new AuthenticationException("User disabled");
    }

    int length = newPassword.length();
    if ( length < 7 || length > 32 ) {
      throw new RuntimeException("Password must be 7-32 characters long");
    }

    if ( newPassword.equals(newPassword.toLowerCase()) ) {
      throw new RuntimeException("Password must have one capital letter");
    }

    if ( ! newPassword.matches(".*\\d+.*") ) {
      throw new RuntimeException("Password must have one numeric character");
    }

    if ( alphanumeric.matcher(newPassword).matches() ) {
      throw new RuntimeException("Password must not contain: !@#$%^&*()_+");
    }

    // old password does not match
    if ( ! Password.verify(oldPassword, user.getPassword()) ) {
      throw new RuntimeException("Old password is incorrect");
    }

    // new password is the same
    if ( Password.verify(newPassword, user.getPassword()) ) {
      throw new RuntimeException("New password must be different");
    }

    // store new password in DAO and put in context
    user = (User) user.fclone();
    user.setPasswordLastModified(Calendar.getInstance().getTime());
    user.setPreviousPassword(user.getPassword());
    user.setPassword(Password.hash(newPassword));
    user = (User) userDAO_.put(user);
    session.setContext(session.getContext().put("user", user));
    return user;
  }

  /**
   * Used to validate properties of a user. This will be called on registration of users
   * Will mainly be used as a veto method.
   * Users should have id, email, first name, last name, password for registration
   */
  public void validateUser(X x, User user) throws AuthenticationException {
    if ( user == null ) {
      throw new AuthenticationException("Invalid User");
    }

    if ( SafetyUtil.isEmpty(user.getEmail()) ) {
      throw new AuthenticationException("Email is required for creating a user");
    }

    if ( ! Email.isValid(user.getEmail()) ) {
      throw new AuthenticationException("Email format is invalid");
    }

    if ( SafetyUtil.isEmpty(user.getFirstName()) ) {
      throw new AuthenticationException("First Name is required for creating a user");
    }

    if ( SafetyUtil.isEmpty(user.getLastName()) ) {
      throw new AuthenticationException("Last Name is required for creating a user");
    }

    if ( SafetyUtil.isEmpty(user.getPassword()) ) {
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
  public void logout(X x) {
    Session session = x.get(Session.class);
    if ( session != null && session.getUserId() != 0 ) {
      sessionDAO_.remove(session);
    }
  }
}
