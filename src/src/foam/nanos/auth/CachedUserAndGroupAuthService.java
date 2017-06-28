package foam.nanos.auth;

import foam.core.X;
import foam.nanos.util.LRULinkedHashMap;
import java.util.Map;
import java.util.HashMap;

/**
 * Created by marcroopchand on 2017-05-30.
 */
public class CachedUserAndGroupAuthService
  extends UserAndGroupAuthService
{
  /**
   * The cached data structure will look like this
   *{
   *  user1: {
   *    permission1: true,
   *    permission2: false
   *    ...
   *  },
   *  user2: {
   *    permission1: false,
   *    permission2: true
   *    ...
   *  }
   *  ...
   *}
   */
  protected Map<String, Map<String, Boolean>> userMap = new LRULinkedHashMap<>(1000000);
  protected Map<String, Boolean> permissionMap;

  @Override
  public Boolean check(foam.core.X x, java.security.Permission permission) {
    if ( x == null || permission == null ) return false;

    User user = (User) x.get("user");
    if ( user == null ) return false;

    Group group = (Group) user.getGroup();
    if ( group == null ) return false;

    if ( userMap.containsKey(user.getId()) ) {
      permissionMap = userMap.get(user.getId());
    }
    else {
      permissionMap = new HashMap<>();
    }

    if ( permissionMap.containsKey(permission.getName()) ) {
      return permissionMap.get(permission.getName());
    }

    boolean permissionCheck = group.implies(permission);
    permissionMap.put(permission.getName(), permissionCheck);
    userMap.put(user.getId(), permissionMap);

    return permissionCheck;
  }

  @Override
  public void logout(X x) {
    if ( x == null ) return;

    User user = (User) x.get("user");
    if ( user == null ) return;

    userMap.remove(user.getId());
  }
}
