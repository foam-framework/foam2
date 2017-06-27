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
  protected Map<String, X> loginMap = new LRULinkedHashMap<>(10000);

  public X login(String userId, String password) {
    if ( userId == null || userId == "" ) return null;
    if ( password == null || password == "" ) return null;

    if ( loginMap.containsKey(userId) ) {
      return loginMap.get(userId);
    }

    try {
      X x = super.login(userId, password);
      loginMap.put(userId, x);
      return x;

    } catch (LoginException e) {
      e.printStackTrace();
    }

    return null;
  }

  public void logout(X x) {
    if ( x == null ) return;

    User user = (User) x.get("user");
    if ( user == null ) return;

    loginMap.remove(user.getEmail());

    super.logout(x);
  }
}
