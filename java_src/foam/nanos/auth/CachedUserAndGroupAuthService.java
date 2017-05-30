package foam.nanos.auth;

import java.util.concurrent.ConcurrentHashMap;

/**
 * Created by marcroopchand on 2017-05-30.
 */
public class CachedUserAndGroupAuthService
  extends UserAndGroupAuthService
{
  protected ConcurrentHashMap<String, Boolean> cachedPermissionCheck;

  @Override
  public void start() {
    super.start();
    cachedPermissionCheck = new ConcurrentHashMap<>();
  }

  @Override
  public Boolean check(foam.core.X x, java.security.Permission permission) {
    if ( x == null || permission == null ) {
      return false;
    }

    User user = (User) x.get("user");
    if ( user == null ) {
      return false;
    }

    String key = user.getId() + permission.getName();

    if (cachedPermissionCheck.containsKey(key)) {
      return cachedPermissionCheck.get(key);
    }

    Group group = (Group) user.getGroup();
    if ( group == null ) {
      return false;
    }

    Boolean permissionCheck = group.implies(permission.getName());
    cachedPermissionCheck.put(key, permissionCheck);

    return permissionCheck;
  }
}