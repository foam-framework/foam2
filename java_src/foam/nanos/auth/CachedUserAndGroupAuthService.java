package foam.nanos.auth;

import foam.core.X;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Created by marcroopchand on 2017-05-30.
 */
public class CachedUserAndGroupAuthService extends UserAndGroupAuthService {
  /**
   * The cached data structure will look like this
   *
   *{
   *  permission1: {
   *    user1: true,
   *    user2: false
   *},
   *  permission2: {
   *    user1: false,
   *    user2: true
   *  }
   *}
   *
   * Its still a quick operation to read, just grab the permisson, supplied
   * and get the value for the user.
   *
   * When a user logout, walk through all the permissions and remove the user
   * from each if it exist
   */

  //TODO: Limit the size of this map to 10000
  protected ConcurrentHashMap<String, ConcurrentHashMap<String, Boolean>> permissionMap;

  @Override
  public void start() {
    super.start();
    permissionMap = new ConcurrentHashMap<>();
  }

  @Override
  public Boolean check(foam.core.X x, java.security.Permission permission) {
    if (x == null || permission == null) {
      return false;
    }

    User user = (User) x.get("user");
    if (user == null) {
      return false;
    }

    Group group = (Group) user.getGroup();
    if (group == null) {
      return false;
    }

    if (permissionMap.containsKey(permission.getName())) {
      ConcurrentHashMap<String, Boolean> userMap = permissionMap.get(permission.getName());

      if (userMap.containsKey(user.getId())) {
        return userMap.get(user.getId());
      }

      Boolean permissionCheck = group.implies(permission.getName());
      userMap.put(user.getId(), permissionCheck);
      return permissionCheck;
    }
    else {
      ConcurrentHashMap<String, Boolean> userMap = new ConcurrentHashMap<>();
      Boolean permissionCheck = group.implies(permission.getName());
      userMap.put(user.getId(), permissionCheck);

      permissionMap.put(permission.getName(), userMap);

      return permissionCheck;
    }
  }

  @Override
  public X logout(X x) {
    if (x == null) {
      return null;
    }

    User user = (User) x.get("user");
    if (user == null) {
      return null;
    }

    for (String key: permissionMap.keySet()) {
      ConcurrentHashMap<String, Boolean> userMap = permissionMap.get(key);
      if (userMap.containsKey(user.getId())) {
        userMap.remove(user.getId());
      }
    }

    return this.getX().put("user", null);
  }
}