/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import foam.core.FObject;
import foam.core.X;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.mlang.sink.Count;
import foam.nanos.auth.AuthService;

import javax.security.auth.AuthPermission;
import java.security.Permission;

public class AuthenticatedDAO
    extends ProxyDAO
{
  protected String prefix;

  public AuthenticatedDAO(DAO delegate) {
    setDelegate(delegate);
    prefix = delegate.getClass().getSimpleName();
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Permission permission;
    AuthService authService = (AuthService) x.get("auth");

    Object id = obj.getProperty("id");
    if ( id == null || getDelegate().find(id) == null ) {
      permission = new AuthPermission(prefix + ".create");
    } else {
      permission = new AuthPermission(prefix + ".update." + id);
    }

    if ( ! authService.check(x, permission) ) {
      throw new RuntimeException();
    }

    return super.put_(x, obj);
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    AuthService authService = (AuthService) x.get("auth");
    Permission permission = new AuthPermission(prefix + ".remove." + obj.getProperty("id"));
    if ( ! authService.check(x, permission) ) {
      throw new RuntimeException();
    }

    return super.remove_(x, obj);
  }

  @Override
  public FObject find_(X x, Object id) {
    AuthService authService = (AuthService) x.get("auth");
    Permission permission = new AuthPermission(prefix + ".read." + id);
    if ( ! authService.check(x, permission) ) {
      throw new RuntimeException("");
    }

    return super.find_(x, id);
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    AuthService authService = (AuthService) x.get("auth");
    Permission permission = new AuthPermission(prefix + ".read");
    if ( ! authService.check(x, permission) ) {
      throw new RuntimeException("");
    }

    return super.select_(x, sink, skip, limit, order, predicate);
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    AuthService authService = (AuthService) x.get("auth");
    Permission permission = new AuthPermission(prefix + ".delete");
    if ( ! authService.check(x, permission) ) {
      throw new RuntimeException("");
    }

    super.removeAll_(x, skip, limit, order, predicate);
  }

  @Override
  public void listen_(X x, Sink sink, Predicate predicate) {
    AuthService authService = (AuthService) x.get("auth");
    Permission permission = new AuthPermission(prefix + ".listen");
    if ( ! authService.check(x, permission) ) {
      throw new RuntimeException("");
    }

    super.listen_(x, sink, predicate);
  }

  @Override
  public void pipe_(X x, Sink sink) {
    AuthService authService = (AuthService) x.get("auth");
    Permission permission = new AuthPermission(prefix + ".pipe");
    if ( ! authService.check(x, permission) ) {
      throw new RuntimeException("");
    }

    super.pipe_(x, sink);
  }
}