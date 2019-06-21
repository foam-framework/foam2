/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.nanos.auth;

import foam.core.X;
import foam.core.XFactory;
import foam.nanos.session.Session;
import java.security.Permission;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;
import javax.security.auth.AuthPermission;


/** Only return value if the session context hasn't changed. **/
class SessionContextCacheFactory
  implements XFactory
{
  protected X      sessionX_;
  protected Object value_;

  public SessionContextCacheFactory(Object value) {
    value_ = value;
  }

  public Object create(X x) {
    Session session = (Session) x.get(Session.class);
    if ( session == null ) return null;
    if ( sessionX_ == null ) sessionX_ = session.getContext();
    if ( sessionX_ != session.getContext() ) return null;
    return value_;
  }
}


/**
 * Decorator to add Caching to AuthService.
 * Stores cache in user Session so that memory is freed when user logs out.
 **/
public class CachingAuthService
  extends ProxyAuthService
{

  public static String CACHE_KEY = "CachingAuthService.PermissionCache";

  protected static Map getPermissionMap(X x) {
    Session session = (Session) x.get(Session.class);
    Map map = (Map) session.getContext().get(CACHE_KEY);

    if ( map == null ) {
      map = new ConcurrentHashMap();
      session.setContext(session.getContext().putFactory(
        CACHE_KEY,
        new SessionContextCacheFactory(map)));
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
