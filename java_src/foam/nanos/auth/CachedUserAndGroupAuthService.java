package foam.nanos.auth;

import foam.core.X;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Created by marcroopchand on 2017-05-30.
 */
public class CachedUserAndGroupAuthService extends UserAndGroupAuthService {
  /**
   * The cached data structure will look like this
   *{
   *  permission1: {
   *    user1: true,
   *    user2: falsex
   *    ...
   *  },
   *  permission2: {
   *    user1: false,
   *    user2: true
   *    ...
   *  }
   *  ...
   *}
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

    /**
     * Check if data is already cached, if it is return this data
     * If not, save it to the maps
     * */
    if (permissionMap.containsKey(permission.getName())) {
      ConcurrentHashMap<String, Boolean> userMap = permissionMap.get(permission.getName());

      if (userMap.containsKey(user.getId())) {
        return userMap.get(user.getId());
      }

      Boolean permissionCheck = group.implies(permission.getName());
      userMap.put(user.getId(), permissionCheck);
      permissionMap.put(permission.getName(), userMap);
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

  /**
   * On logout, walk through entire map and remove all instances of the user
   * */
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