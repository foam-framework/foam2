/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.nanos.auth;

import foam.core.Detachable;
import foam.core.X;
import foam.core.XFactory;
import foam.dao.DAO;
import foam.dao.Sink;
import foam.mlang.predicate.Predicate;
import foam.nanos.session.Session;
import java.security.Permission;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;
import javax.security.auth.AuthPermission;

import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.OR;
import static foam.mlang.MLang.TRUE;

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
    Session session = x.get(Session.class);
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
  /**
   * A list of DAOs that will be listened to. When any of these DAOs update, the
   * cache will be invalidated. Use this to listen to DAOs that are specific to
   * your application.
   * FUTURE: Support supplying predicates to pass to the listeners as well.
   */
  protected String[] extraDAOsToListenTo_;
  public static String CACHE_KEY = "CachingAuthService.PermissionCache";

  protected static Map<String,Boolean> getPermissionMap(final X x) {
    Session             session = x.get(Session.class);
    Map<String,Boolean> map     = (Map) session.getContext().get(CACHE_KEY);

    if ( map == null ) {
      Sink purgeSink = new Sink() {
        public void put(Object obj, Detachable sub) {
          purgeCache(x);
          sub.detach();
        }
        public void remove(Object obj, Detachable sub) {
          purgeCache(x);
          sub.detach();
        }
        public void eof() {
        }
        public void reset(Detachable sub) {
          purgeCache(x);
          sub.detach();
        }
      };

      DAO userDAO       = (DAO) x.get("localUserDAO");
      DAO groupDAO      = (DAO) x.get("localGroupDAO");
      DAO groupPermissionJunctionDAO = (DAO) x.get("groupPermissionJunctionDAO");
      Subject subject   = (Subject) x.get("subject");
      User user         = subject.getUser();
      User agent        = subject.getRealUser();
      Predicate predicate = EQ(User.ID, user.getId());

      if ( agent != user ) {
        predicate = OR(predicate, EQ(User.ID, agent.getId()));
      }

      groupDAO.listen(purgeSink, TRUE);
      userDAO.listen(purgeSink, predicate);
      groupPermissionJunctionDAO.listen(purgeSink, TRUE);

      String[] extraDAOsToListenTo = (String[]) x.get("extraDAOsToListenTo");

      if ( extraDAOsToListenTo != null ) {
        for ( String daoName : extraDAOsToListenTo ) {
          DAO dao = (DAO) x.get(daoName);
          if ( dao != null ) dao.listen(purgeSink, TRUE);
        }
      }

      map = new ConcurrentHashMap<String,Boolean>();
      session.setContext(session.getContext().putFactory(
        CACHE_KEY,
        new SessionContextCacheFactory(map)));
    }

    return map;
  }

  public static void purgeCache(X x) {
    Session session = x.get(Session.class);
    session.setContext(session.getContext().put(CACHE_KEY, null));
  }

  public CachingAuthService(AuthService delegate) {
    this(delegate, new String[0]);
  }

  public CachingAuthService(AuthService delegate, String[] extraDAOsToListenTo) {
    setDelegate(delegate);
    extraDAOsToListenTo_ = extraDAOsToListenTo;
  }

  @Override
  public boolean check(foam.core.X x, String permission) {
    if ( x == null || permission == null ) return false;
    Permission p = new AuthPermission(permission);

    Map<String,Boolean> map = getPermissionMap(x.put("extraDAOsToListenTo", extraDAOsToListenTo_));

    if ( map.containsKey(p.getName()) ) {
      return map.get(p.getName());
    }

    boolean permissionCheck = getDelegate().check(x, permission);

    map.put(p.getName(), permissionCheck);

    return permissionCheck;
  }
}
