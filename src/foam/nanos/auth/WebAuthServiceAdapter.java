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
  protected Map<String, X> loginMap = new LRULinkedHashMap<>(10000);
  protected AuthService service;

  public void start() {
    service = (AuthService) getX().get("auth");
    service.start();
  }

  public String generateChallenge(String userId) {
    return service.generateChallenge(userId);
  }

  public void challengedLogin(String userId, String challenge) {
    try {
      X x = service.challengedLogin(userId, challenge);
      loginMap.put(userId, x);
    } catch (RuntimeException e) {
      e.printStackTrace();
    }
  }

  public void login(String userId, String password) {
    try {
      if ( ! loginMap.containsKey(userId) ) {
        X x = service.login(userId, password);
        loginMap.put(userId, x);
      }
    } catch (RuntimeException e) {
      e.printStackTrace();
    }
  }

  public Boolean check(String userId, java.security.Permission permission) {
    if ( userId == null || userId == "" ) return false;

    if ( loginMap.containsKey(userId) ) {
      return service.check(loginMap.get(userId), permission);
    }

    return false;
  }

  public void updatePassword(String userId, String oldPassword, String newPassword) {
    if ( userId == null || userId == "" ) return;

    if ( loginMap.containsKey(userId) ) {
      service.updatePassword(loginMap.get(userId), oldPassword, newPassword);
    }
  }

  public Boolean validateUser(User user) {
    return service.validateUser(user);
  }

  public void logout(String userId) {
    if ( userId == null || userId == "" ) return;

    if ( loginMap.containsKey(userId) ) {
      service.logout(loginMap.get(userId));
      loginMap.remove(userId);
    }
  }
}
