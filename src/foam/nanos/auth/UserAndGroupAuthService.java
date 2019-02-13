/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.auth;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.Sink;
import foam.mlang.MLang;
import foam.nanos.logger.Logger;
import foam.nanos.NanoService;
import foam.nanos.session.Session;
import foam.util.Email;
import foam.util.Password;
import foam.util.SafetyUtil;
import javax.security.auth.AuthPermission;
import java.security.Permission;
import java.util.Calendar;
import java.util.List;
import java.util.regex.Pattern;
import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;

public class UserAndGroupAuthService
  extends    ContextAwareSupport
  implements AuthService, NanoService
{
  protected DAO userDAO_;
  protected DAO groupDAO_;
  protected DAO sessionDAO_;

  public final static String CHECK_USER_PERMISSION = "service.auth.checkUser";

  public UserAndGroupAuthService(X x) {
    setX(x);
  }

  @Override
  public void start() {
    userDAO_    = (DAO) getX().get("localUserDAO");
    groupDAO_   = (DAO) getX().get("localGroupDAO");
    sessionDAO_ = (DAO) getX().get("localSessionDAO");
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

    // check if user enabled
    if ( ! user.getEnabled() ) {
      throw new AuthenticationException("User disabled");
    }

    // check if user login enabled
    if ( ! user.getLoginEnabled() ) {
      throw new AuthenticationException("Login disabled");
    }

    // check if user group enabled
    Group group = (Group) groupDAO_.find(user.getGroup());
    if ( group != null && ! group.getEnabled() ) {
      throw new AuthenticationException("User group disabled");
    }

    // check for two-factor authentication
    if ( user.getTwoFactorEnabled() && ! session.getContext().getBoolean("twoFactorSuccess") ) {
      throw new AuthenticationException("User requires two-factor authentication");
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
    Logs user and sets user group into the current sessions context.
   */
  private User userAndGroupContext(X x, User user, String password) throws AuthenticationException {
    if ( user == null ) {
      throw new AuthenticationException("User not found");
    }

    // check if user enabled
    if ( ! user.getEnabled() ) {
      throw new AuthenticationException("User disabled");
    }

    // check if user login enabled
    if ( ! user.getLoginEnabled() ) {
      throw new AuthenticationException("Login disabled");
    }

    // check if user group enabled
    Group group = (Group) groupDAO_.find(user.getGroup());
    if ( group != null && ! group.getEnabled() ) {
      throw new AuthenticationException("User group disabled");
    }

    if ( ! Password.verify(password, user.getPassword()) ) {
      throw new AuthenticationException("Invalid Password");
    }

    // Freeze user
    user = (User) user.fclone();
    user.freeze();

    Session session = x.get(Session.class);
    session.setUserId(user.getId());
    session.setContext(session.getContext().put("user", user));

    return user;
  }

  /**
   * Login a user by the id provided, validate the password
   * and return the user in the context.
   */
  public User login(X x, long userId, String password) throws AuthenticationException {
    if ( userId < 1 || SafetyUtil.isEmpty(password) ) {
      throw new AuthenticationException("Invalid Parameters");
    }

    return userAndGroupContext(x, (User) userDAO_.find(userId), password);
  }

  public User loginByEmail(X x, String email, String password) throws AuthenticationException {
    User user = (User) userDAO_.find(
      AND(
        EQ(User.EMAIL, email.toLowerCase()),
        EQ(User.LOGIN_ENABLED, true)
      )
    );

    if ( user == null ) {
      throw new AuthenticationException("User not found");
    }
    return userAndGroupContext(x, user, password);
  }

  /**
    Checks if the user passed into the method has the passed
    in permission attributed to it by checking their group.
    No check on User and group enabled flags.
  */
  public boolean checkUserPermission(foam.core.X x, User user, Permission permission) {
    // check whether user has permission to check user permissions
    if ( ! check(x, CHECK_USER_PERMISSION) ) {
      throw new AuthorizationException();
    }

    if ( user == null || permission == null ) {
      return false;
    }

    try {
      String groupId = (String) user.getGroup();

      while ( ! SafetyUtil.isEmpty(groupId) ) {
        Group group = (Group) groupDAO_.find(groupId);

        // if group is null break
        if ( group == null ) {
          break;
        }

        // check permission
        if ( group.implies(permission) ) {
          return true;
        }

        // check parent group
        groupId = group.getParent();
      }
    } catch (Throwable t) {
    }

    return false;
  }

  /**
   * Check if the user in the context supplied has the right permission
   * Return Boolean for this
   */
  public boolean checkPermission(foam.core.X x, Permission permission) {
    if ( x == null || permission == null ) {
      return false;
    }

    Session session = x.get(Session.class);
    if ( session == null || session.getUserId() == 0 ) {
      return false;
    }

    // NOTE: It's important that we use the User from the context here instead
    // of looking it up in a DAO because if the user is actually an entity that
    // an agent is acting as, then the user we get from the DAO won't have the
    // correct group, which is the group set on the junction between the agent
    // and the entity.
    User user = (User) x.get("user");

    // check if user exists and is enabled
    if ( user == null || ! user.getEnabled() ) {
      return false;
    }

    try {
      String groupId = (String) user.getGroup();

      while ( ! SafetyUtil.isEmpty(groupId) ) {
        Group group = (Group) groupDAO_.find(groupId);

        // if group is null break
        if ( group == null ) {
          break;
        }

        // check if group is enabled
        if ( ! group.getEnabled() ) {
          return false;
        }

        // check permission
        if ( group.implies(permission) ) {
          return true;
        }

        // check parent group
        groupId = group.getParent();
      }
    } catch (IllegalArgumentException e) {
      Logger logger = (Logger) x.get("logger");
      logger.error("check", permission, e);
    } catch (Throwable t) {
    }

    return false;
  }


  public boolean check(foam.core.X x, String permission) {
    return checkPermission(x, new AuthPermission(permission));
  }

  private String passwordValidationRegex() {
    return "^.{6,}$"; // Minimum 6 characters
  }

  private String passwordValidationErrorMessage() {
    return "Password must be at least 6 characters long";
  }

  public void validatePassword( String newPassword ) {
    Pattern passwordValidationPattern = Pattern.compile(passwordValidationRegex());
    String passwordErrorMessage = passwordValidationErrorMessage();
    if ( SafetyUtil.isEmpty(newPassword) || ! passwordValidationPattern.matcher(newPassword).matches() ) {
      throw new RuntimeException(passwordErrorMessage);
    }
  }

  public boolean checkUser(foam.core.X x, User user, String permission) {
    return checkUserPermission(x, user, new AuthPermission(permission));
  }

  /**
   * Given a context with a user, validate the password to be updated
   * and return a context with the updated user information
   */
  public User updatePassword(foam.core.X x, String oldPassword, String newPassword) throws AuthenticationException {
    if ( x == null || SafetyUtil.isEmpty(oldPassword) || SafetyUtil.isEmpty(newPassword) ) {
      throw new RuntimeException("Password fields cannot be blank");
    }

    Session session = x.get(Session.class);
    if ( session == null || session.getUserId() == 0 ) {
      throw new AuthenticationException("User not found");
    }

    User user = (User) userDAO_.find(session.getUserId());
    if ( user == null ) {
      throw new AuthenticationException("User not found");
    }

    // check if user enabled
    if ( ! user.getEnabled() ) {
      throw new AuthenticationException("User disabled");
    }

    // check if user login enabled
    if ( ! user.getLoginEnabled() ) {
      throw new AuthenticationException("Login disabled");
    }

    // check if user group enabled
    Group group = (Group) groupDAO_.find(user.getGroup());
    if ( group != null && ! group.getEnabled() ) {
      throw new AuthenticationException("User group disabled");
    }

    // check if password is valid per validatePassword method
    validatePassword(newPassword);

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
    // TODO: modify line to allow actual setting of password expiry in cases where users are required to periodically update their passwords
    user.setPasswordExpiry(null);
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

    validatePassword(user.getPassword());
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
