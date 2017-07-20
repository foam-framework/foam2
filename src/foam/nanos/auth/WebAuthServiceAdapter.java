/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.auth;

import foam.core.X;
import foam.util.LRULinkedHashMap;
import java.util.Map;

/**
 * Created by marcroopchand on 2017-06-27.
 */
public class WebAuthServiceAdapter
  implements WebAuthService
{
  /**
   * Map of { userId: X }
   *
   * This will be used for web clients logging in since they can't
   * marshall a context
   * */
  protected Map<String, X> loginMap = new LRULinkedHashMap<>(10000);
  protected final AuthService service_;

  public WebAuthServiceAdapter() {
    this(new UserAndGroupAuthService());
  }

  public WebAuthServiceAdapter(AuthService service) {
    service_ = service;
  }

  public void start() {
    service_.start();
  }

  public String generateChallenge(String userId) {
    return service_.generateChallenge(userId);
  }

  public void challengedLogin(String userId, String challenge) {
    try {
      X x = service_.challengedLogin(userId, challenge);
      loginMap.put(userId, x);
    } catch (RuntimeException e) {
      e.printStackTrace();
    }
  }

  public void login(String userId, String password) {
    try {
      if ( ! loginMap.containsKey(userId) ) {
        X x = service_.login(userId, password);
        loginMap.put(userId, x);
      }
    } catch (RuntimeException e) {
      e.printStackTrace();
    }
  }

  public Boolean check(String userId, java.security.Permission permission) {
    if ( userId == null || userId == "" ) return false;

    if ( loginMap.containsKey(userId) ) {
      return service_.check(loginMap.get(userId), permission);
    }

    return false;
  }

  public void updatePassword(String userId, String oldPassword, String newPassword) {
    if ( userId == null || userId == "" ) return;

    if ( loginMap.containsKey(userId) ) {
      service_.updatePassword(loginMap.get(userId), oldPassword, newPassword);
    }
  }

  public Boolean validateUser(User user) {
    return service_.validateUser(user);
  }

  public void logout(String userId) {
    if ( userId == null || userId == "" ) return;

    if ( loginMap.containsKey(userId) ) {
      service_.logout(loginMap.get(userId));
      loginMap.remove(userId);
    }
  }
}
