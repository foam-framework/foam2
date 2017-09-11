/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.auth;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.ListSink;
import foam.mlang.MLang;
import foam.util.LRULinkedHashMap;
import java.util.Map;
import foam.core.ContextAwareSupport;
import javax.security.auth.AuthPermission;

public class WebAuthServiceAdapter
  extends    ContextAwareSupport
  implements WebAuthService
{
  /**
   * Map of { userId: X }
   *
   * This will be used for web clients logging in since they can't
   * marshall a context
   * */
  protected Map<Long, X> loginMap = new LRULinkedHashMap<>(10000);
  protected AuthService service;

  public void start() {
    service = (AuthService) getX().get("auth");
  }

  public String generateChallenge(long userId) throws RuntimeException {
    try {
      return service.generateChallenge(userId);
    } catch (RuntimeException e) {
      throw e;
    }
  }

  public foam.nanos.auth.User challengedLogin(long userId, String challenge)
    throws RuntimeException
  {
    try {
      X x = service.challengedLogin(userId, challenge);
      loginMap.put(userId, x);
      return (User) x.get("user");
    } catch (RuntimeException e) {
      throw e;
    }
  }

  public foam.nanos.auth.User login(String email, String password)
    throws RuntimeException
  {
    DAO userDAO   = (DAO) getX().get("localUserDAO");
    ListSink sink = (ListSink) userDAO.where(MLang.EQ(email, User.EMAIL)).select(new ListSink());

    //There should only be one object returned for the User
    if ( sink.getData().size() != 1 ) {
      throw new RuntimeException("Invalid User");
    }

    User user = (User) sink.getData().get(0);

    try {
      if ( ! loginMap.containsKey(user.getId()) ) {
        X x = service.login(user.getId(), password);
        loginMap.put(user.getId(), x);
        return (User) x.get("user");
      }
      return (User) loginMap.get(user.getId()).get("user");

    } catch (RuntimeException e) {
      throw e;
    }
  }

  public Boolean check(long userId, foam.nanos.auth.Permission permission) {
    if ( userId < 1 ) return false;

    if ( loginMap.containsKey(userId) ) {
      return service.check(loginMap.get(userId), new AuthPermission(permission.getId()));
    }
    return false;
  }

  public void updatePassword(long userId, String oldPassword, String newPassword)
    throws RuntimeException
  {
    if ( userId < 1 ) {
      throw new RuntimeException("Invalid User Id");
    }

    try {
      if ( loginMap.containsKey(userId) ) {
        X x = service.updatePassword(loginMap.get(userId), oldPassword, newPassword);
        loginMap.put(userId, x);
      }
      else {
        throw new RuntimeException("User not Logged in");
      }
    } catch (RuntimeException e) {
      throw e;
    }
  }

  public void logout(long userId) {
    if ( userId < 1 ) return;

    if ( loginMap.containsKey(userId) ) {
      service.logout(loginMap.get(userId));
      loginMap.remove(userId);
    }
  }
}
