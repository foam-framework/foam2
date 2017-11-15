/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.auth;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ListSink;
import foam.dao.Sink;
import foam.mlang.MLang;
import foam.nanos.NanoService;
import foam.nanos.session.Session;
import foam.util.Email;
import foam.util.LRULinkedHashMap;
import foam.util.Password;
import foam.util.SafetyUtil;

import javax.naming.AuthenticationException;
import java.util.*;

public class UserAndGroupAuthService
    extends    ContextAwareSupport
    implements AuthService, NanoService
{
  protected DAO userDAO_;
  protected DAO groupDAO_;
  protected DAO sessionDAO_;
  protected Map challengeMap; // TODO: let's store in Session Context instead

  @Override
  public void start() {
    userDAO_      = (DAO) getX().get("localUserDAO");
    groupDAO_     = (DAO) getX().get("groupDAO");
    sessionDAO_   = (DAO) getX().get("sessionDAO");
    challengeMap  = new LRULinkedHashMap<Long, Challenge>(20000);
  }

  public User getCurrentUser(X x) {
    // fetch context and check if not null or user id is 0
    Session session = (Session) x.get(Session.class);
    if ( session == null || session.getUserId() == 0 ) {
      // no user found
      return null;
    }

    // get user from session id
    User user = (User) userDAO_.find(session.getUserId());
    if ( user == null ) {
      return null;
    }

    // store user and return
    session.setX(getX().put("user", user));
    return (User) Password.sanitize(user);
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
  public User challengedLogin(X x, long userId, String challenge) throws AuthenticationException {
    if ( userId < 1 || "".equals(challenge) ) {
      throw new AuthenticationException("Invalid Parameters");
    }

    Challenge c = (Challenge) challengeMap.get(userId);
    if ( c == null ) {
      throw new AuthenticationException("Invalid userId");
    }

    if ( ! c.getChallenge().equals(challenge) ) {
      throw new AuthenticationException("Invalid Challenge");
    }

    if ( new Date().after(c.getTtl()) ) {
      challengeMap.remove(userId);
      throw new AuthenticationException("Challenge expired");
    }

    User user = (User) userDAO_.find(userId);
    if ( user == null ) {
      throw new AuthenticationException("User not found");
    }

    challengeMap.remove(userId);

    Session session = (Session) x.get(Session.class);
    session.setUserId(user.getId());
    session.setX(getX().put("user", user));
    sessionDAO_.put(session);
    return (User) Password.sanitize(user);
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

    if ( ! Password.verify(password, user.getPassword()) ) {
      throw new AuthenticationException("Invalid Password");
    }

    Session session = (Session) x.get(Session.class);
    session.setUserId(user.getId());
    session.setX(getX().put("user", user));
    sessionDAO_.put(session);
    return (User) Password.sanitize(user);
  }

  public User loginByEmail(X x, String email, String password) throws AuthenticationException {
    if ( SafetyUtil.isEmpty(email) || ! Email.isValid(email) ) {
      throw new AuthenticationException("Invalid email");
    }

    if ( SafetyUtil.isEmpty(password) || ! Password.isValid(password) ) {
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

    Session session = (Session) x.get(Session.class);
    session.setUserId(user.getId());
    session.setX(getX().put("user", user));
    sessionDAO_.put(session);
    return (User) Password.sanitize(user);
  }

  /**
   * Check if the user in the context supplied has the right permission
   * Return Boolean for this
   */
  public Boolean check(foam.core.X x, java.security.Permission permission) {
    if ( x == null || permission == null ) {
      return false;
    }

    Session session = (Session) x.get(Session.class);
    if ( session == null || session.getUserId() == 0 ) {
      return false;
    }

    User user = (User) userDAO_.find(session.getUserId());
    if ( user == null ) {
      return false;
    }

    Group group = (Group) user.getGroup();
    if ( group == null ) {
      return false;
    }

    return group.implies(permission);
  }

  /**
   * Given a context with a user, validate the password to be updated
   * and return a context with the updated user information
   */
  public User updatePassword(foam.core.X x, String oldPassword, String newPassword) throws AuthenticationException {
    if ( x == null || SafetyUtil.isEmpty(oldPassword) || SafetyUtil.isEmpty(newPassword) ) {
      throw new AuthenticationException("Invalid parameters");
    }

    Session session = (Session) x.get(Session.class);
    if ( session == null || session.getUserId() == 0 ) {
      throw new AuthenticationException("User not found");
    }

    User user = (User) userDAO_.find(session.getUserId());
    if ( user == null ) {
      throw new AuthenticationException("User not found");
    }

    // invalid password
    if ( ! Password.isValid(newPassword) ) {
      throw new AuthenticationException("Password needs to minimum 8 characters, contain at least one uppercase, one lowercase and a number");
    }

    // old password does not match
    if ( ! Password.verify(oldPassword, user.getPassword()) ) {
      throw new AuthenticationException("Old password is incorrect");
    }

    // new password is the same
    if ( Password.verify(newPassword, user.getPassword()) ) {
      throw new AuthenticationException("New password must be different");
    }

    // store new password in DAO and put in context
    user.setPasswordLastModified(Calendar.getInstance().getTime());
    user.setPreviousPassword(user.getPassword());
    user.setPassword(Password.hash(newPassword));
    user = (User) userDAO_.put(user);
    session.setX(getX().put("user", user));
    return (User) Password.sanitize(user);
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
    Session session = (Session) x.get(Session.class);
    if ( session != null && session.getUserId() != 0 ) {
      sessionDAO_.remove(session);
    }
  }
}
