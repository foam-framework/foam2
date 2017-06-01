package foam.nanos.auth;

import foam.core.X;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by marcroopchand on 2017-05-30.
 */
public class CachedUserAndGroupAuthService extends UserAndGroupAuthService {
  /**
   * The cached data structure will look like this
   *{
   *  permission1: {
   *    user1: true,
   *    user2: false
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

  protected Map<String, Map<String, Boolean>> permissionMap;

  @Override
  public void start() {
    super.start();
    permissionMap = new LRULinkedHashMap<>(100);
  }

  @Override
  public Boolean check(foam.core.X x, java.security.Permission permission) {
    if ( x == null || permission == null ) return false;

    User user = (User) x.get("user");
    if ( user == null ) return false;

    Group group = (Group) user.getGroup();
    if ( group == null ) return false;

    /**
     * Check if data is already cached, if it is return this data
     * If not, save it to the maps
     * */
    if ( permissionMap.containsKey(permission.getName()) ) {
      Map<String, Boolean> userMap = permissionMap.get(permission.getName());
      if ( userMap.containsKey(user.getId()) ) return userMap.get(user.getId());

      boolean permissionCheck = group.implies(permission);
      userMap.put(user.getId(), permissionCheck);
      permissionMap.put(permission.getName(), userMap);

      return permissionCheck;
    }

    Map<String, Boolean> userMap = new LRULinkedHashMap<>(1000000);
    boolean permissionCheck = group.implies(permission);
    userMap.put(user.getId(), permissionCheck);
    permissionMap.put(permission.getName(), userMap);

    return permissionCheck;
  }

  /**
   * On logout, walk through entire map and remove all instances of the user
   * */
  @Override
  public void logout(X x) {
    if ( x == null ) return;

    User user = (User) x.get("user");
    if ( user == null ) return;

    for ( String key: permissionMap.keySet() ) {
      permissionMap.get(key).remove(user.getId());
    }

    this.getX().put("user", null);
  }
}