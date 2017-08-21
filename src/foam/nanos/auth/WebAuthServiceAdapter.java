/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.auth;

import foam.core.X;
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
    service.start();
  }

  public String generateChallenge(long userId) {
    return service.generateChallenge(userId);
  }

  public void challengedLogin(long userId, String challenge) {
    try {
      X x = service.challengedLogin(userId, challenge);
      loginMap.put(userId, x);
    } catch (RuntimeException e) {
      e.printStackTrace();
    }
  }

  public void login(String email, String password) {
    long userId = 0;
    try {
      if ( ! loginMap.containsKey(userId) ) {
        X x = service.login(userId, password);
        loginMap.put(userId, x);
      }
    } catch (RuntimeException e) {
      e.printStackTrace();
    }
  }

  public Boolean check(long userId, foam.nanos.auth.Permission permission) {
    if ( userId < 1 ) return false;

    if ( loginMap.containsKey(userId) ) {
      return service.check(loginMap.get(userId), new AuthPermission(permission.getId()));
    }

    return false;
  }

  public void updatePassword(long userId, String oldPassword, String newPassword) {
    if ( userId < 1 ) return;

    if ( loginMap.containsKey(userId) ) {
      service.updatePassword(loginMap.get(userId), oldPassword, newPassword);
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
