package foam.nanos.auth;

import foam.core.X;
import foam.nanos.util.LRULinkedHashMap;
import javax.security.auth.login.LoginException;
import java.util.Map;

/**
 * Created by marcroopchand on 2017-06-27.
 */
public class WebAuthService
  extends CachedUserAndGroupAuthService
{
  /**
   * Map of { userId: X }
   *
   * This will be used for web clients logging in since they can't
   * marshall a context
   * */
  protected Map<String, X> loginMap = new LRULinkedHashMap<>(10000);

  public void webLogin(String userId, String password) {
    if ( userId == null || userId == "" ) return;
    if ( password == null || password == "" ) return;

    try {
      if ( ! loginMap.containsKey(userId) ) {
        X x = super.login(userId, password);
        loginMap.put(userId, x);
      }
    } catch (LoginException e) {
      e.printStackTrace();
    }
  }

  public Boolean check(String userId, java.security.Permission permission) {
    if ( userId == null || userId == "" || permission == null ) return false;

    if ( loginMap.containsKey(userId) ) {
      return super.check(loginMap.get(userId), permission);
    }

    return false;
  }

  public void updatePassword(String userId, String oldPassword, String newPassword) {
    if ( userId == null || userId == "" ) return;

    if ( loginMap.containsKey(userId) ) {
      super.updatePassword(loginMap.get(userId), oldPassword, newPassword);
    }
  }

  public void logout(String userId) {
    if ( userId == null || userId == "" ) return;

    if ( loginMap.containsKey(userId) ) {
      super.logout(loginMap.get(userId));
      loginMap.remove(userId);
    }
  }
}
