package foam.nanos.auth;

import foam.core.X;
import foam.nanos.util.LRULinkedHashMap;
import java.util.Map;

/**
 * Created by marcroopchand on 2017-05-30.
 */
public class CachedUserAndGroupAuthService
  extends UserAndGroupAuthService
{
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
  protected Map<String, Map<String, Boolean>> permissionMap = new LRULinkedHashMap<>(1000);
  protected Map<String, Boolean> userMap;

  @Override
  public void start() {
    super.start();
  }

  @Override
  public Boolean check(foam.core.X x, java.security.Permission permission) {
    if ( x == null || permission == null ) return false;

    User user = (User) x.get("user");
    if ( user == null ) return false;

    Group group = (Group) user.getGroup();
    if ( group == null ) return false;

    if ( permissionMap.containsKey(permission.getName()) ) {
      userMap = permissionMap.get(permission.getName());
    }
    else {
      userMap = new LRULinkedHashMap<>(100000);
    }

    if ( userMap.containsKey(user.getId()) ) return userMap.get(user.getId());

    boolean permissionCheck = group.implies(permission);
    userMap.put(user.getId(), permissionCheck);
    permissionMap.put(permission.getName(), userMap);

    return permissionCheck;
  }

  @Override
  public void logout(X x) {
    if ( x == null ) return;

    User user = (User) x.get("user");
    if ( user == null ) return;

    for ( String key: permissionMap.keySet() ) {
      permissionMap.get(key).remove(user.getId());
    }
  }
}