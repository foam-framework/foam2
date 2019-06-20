/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.nanos.auth;

import foam.core.X;
import foam.nanos.session.Session;
import java.security.Permission;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;
import javax.security.auth.AuthPermission;

/**
 * Decorator to add Caching to AuthService.
 * Stores cache in user Session so that memory is freed when user logs out.
 **/
public class CachingAuthService
  extends ProxyAuthService
{

  protected static String CACHE_KEY = "CachingAuthService.PermissionCache";

  protected static Map getPermissionMap(X x) {
    Map map = (Map) x.get(CACHE_KEY);

    if ( map == null ) {
      Session session = (Session) x.get(Session.class);
      map = new ConcurrentHashMap();
      session.setContext(session.getContext().put(CACHE_KEY, map));
    }

    return map;
  }

  public static void purgeCache(X x) {
    getPermissionMap(x).clear();
  }

  public CachingAuthService(AuthService delegate) {
    setDelegate(delegate);
  }

  @Override
  public boolean checkPermission(foam.core.X x, java.security.Permission permission) {
    if ( x == null || permission == null ) return false;

    Map map = getPermissionMap(x);

    if ( map.containsKey(permission.getName()) ) {
      return ((Boolean) map.get(permission.getName())).booleanValue();
    }

    boolean permissionCheck = getDelegate().checkPermission(x, permission);

    map.put(permission.getName(), permissionCheck);

    return permissionCheck;
  }

  @Override
  public boolean check(foam.core.X x, String permission) {
    return checkPermission(x, new AuthPermission(permission));
  }
}
