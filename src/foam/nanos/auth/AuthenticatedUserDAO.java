/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.auth;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.util.SafetyUtil;

import static foam.mlang.MLang.EQ;

/**
 * Authenticate UserDAO
 *
 * Features:
 *  - restrict creation/updating of users
 *  - restrict group of users created/updated
 *  - restrict deletion of users
 *  - restrict selection of users
 *    - can only see self by default
 *    - can see users belonging to groups you can create
 *  - grant access based on SPID
 *  - set SPID to same as user creating new user if they don't have the global
 *    spid property
 **/
public class AuthenticatedUserDAO
  extends ProxyDAO
{
  public final static String GLOBAL_USER_READ   = "user.read.x";
  public final static String GLOBAL_USER_UPDATE = "user.update.x";
  public final static String GLOBAL_USER_DELETE = "user.delete.x";

  public final static String GLOBAL_SPID_READ   = "spid.read.x";
  public final static String GLOBAL_SPID_UPDATE = "spid.update.x";
  public final static String GLOBAL_SPID_DELETE = "spid.delete.x";

  public AuthenticatedUserDAO(X x, DAO delegate) {
    super(x, delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User        user    = (User) x.get("user");
    AuthService auth    = (AuthService) x.get("auth");

    User toPut = (User) obj;
    if ( toPut != null && ! SafetyUtil.equals(toPut.getId(), user.getId()) &&
      ! auth.check(x, GLOBAL_USER_UPDATE) &&
      ! auth.check(x, GLOBAL_SPID_UPDATE) &&
      ! auth.check(x, "spid.update." + user.getSpid()) ) {
      throw new RuntimeException("Unable to update user");
    }

    // set spid if not set
    if ( SafetyUtil.isEmpty((String) toPut.getSpid()) &&
        ! SafetyUtil.isEmpty((String) user.getSpid()) ) {
      toPut.setSpid(user.getSpid());
    }

    return super.put_(x, toPut);
  }

  @Override
  public FObject find_(X x, Object id) {
    User        user = (User) x.get("user");
    AuthService auth = (AuthService) x.get("auth");

    // check if logged in
    if ( user == null ) {
      throw new AuthenticationException();
    }

    // find user and check if current user has permission to read
    User result = (User) super.find_(x, id);
    if ( result != null && ! SafetyUtil.equals(result.getId(), user.getId()) &&
        ! auth.check(x, GLOBAL_USER_READ) &&
        ! auth.check(x, GLOBAL_SPID_READ) &&
        ! auth.check(x, "spid.read." + result.getSpid()) ) {
      return null;
    }

    return result;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    User        user = (User) x.get("user");
    AuthService auth = (AuthService) x.get("auth");

    // check if logged in
    if ( user == null ) {
      throw new AuthenticationException();
    }

    DAO dao;
    if ( auth.check(x, GLOBAL_USER_READ) ) {
      // get all users in system
      dao = getDelegate();
    } else if ( auth.check(x, GLOBAL_SPID_READ) || auth.check(x, "spid.read." + user.getSpid()) ) {
      // get all users under service provider
      dao = getDelegate().where(EQ(User.SPID, user.getSpid()));
    } else {
      // only get authenticated user
      dao = getDelegate().where(EQ(User.ID, user.getId()));
    }
    return dao.select_(x, sink, skip, limit, order, predicate);
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    User        user    = (User) x.get("user");
    AuthService auth    = (AuthService) x.get("auth");

    // check if logged in
    if ( user == null ) {
      throw new AuthenticationException();
    }

    // check if current user has permission to delete
    User toRemove = (User) obj;
    if ( toRemove != null && ! SafetyUtil.equals(toRemove.getId(), user.getId()) &&
        ! auth.check(x, GLOBAL_USER_DELETE) &&
        ! auth.check(x, GLOBAL_SPID_DELETE) &&
        ! auth.check(x, "spid.delete." + toRemove.getSpid()) ) {
      throw new RuntimeException("Unable to delete user");
    }

    return super.remove_(x, obj);
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    User        user = (User) x.get("user");
    AuthService auth = (AuthService) x.get("auth");

    // check if logged in
    if ( user == null ) {
      throw new AuthenticationException();
    }

    DAO dao;
    if ( auth.check(x, GLOBAL_USER_DELETE) ) {
      // delete all users in system
      dao = getDelegate();
    } else if ( auth.check(x, GLOBAL_SPID_DELETE) || auth.check(x, "spid.delete." + user.getSpid()) ) {
      // delete users under service provider
      dao = getDelegate().where(EQ(User.SPID, user.getSpid()));
    } else {
      // only delete authenticated user
      dao = getDelegate().where(EQ(User.ID, user.getId()));
    }

    dao.removeAll_(x, skip, limit, order, predicate);
  }
}
