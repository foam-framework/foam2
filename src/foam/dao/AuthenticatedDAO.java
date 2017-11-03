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
  protected String name_;

  public AuthenticatedDAO(String name, DAO delegate) {
    this.name_ = name;
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Permission permission;
    AuthService authService = (AuthService) x.get("auth");

    Object id = obj.getProperty("id");
    if ( id == null || getDelegate().find(id) == null ) {
      permission = new AuthPermission(name_ + ".create");
    } else {
      permission = new AuthPermission(name_ + ".update." + id);
    }

    if ( ! authService.check(x, permission) ) {
      throw new RuntimeException("Insufficient permissions");
    }

    return super.put_(x, obj);
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    AuthService authService = (AuthService) x.get("auth");
    Permission permission = new AuthPermission(name_ + ".remove." + obj.getProperty("id"));
    if ( ! authService.check(x, permission) ) {
      throw new RuntimeException("Insufficient permissions");
    }

    return super.remove_(x, obj);
  }

  @Override
  public FObject find_(X x, Object id) {
    AuthService authService = (AuthService) x.get("auth");
    Permission permission = new AuthPermission(name_ + ".read." + id);
    if ( ! authService.check(x, permission) ) {
      throw new RuntimeException("Insufficient permissions");
    }

    return super.find_(x, id);
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    if ( ! ( sink instanceof AuthenticatedSink ) ) {
      sink = new AuthenticatedSink(name_, "read", sink);
    }
    return super.select_(x, sink, skip, limit, order, predicate);
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    Sink sink = new AuthenticatedSink(name_, "delete", new RemoveSink(this));
    this.select_(x, sink, skip, limit, order, predicate);
  }

  @Override
  public void listen_(X x, Sink sink, Predicate predicate) {
    if ( ! ( sink instanceof AuthenticatedSink ) ) {
      sink = new AuthenticatedSink(name_, "listen", sink);
    }
    super.listen_(x, sink, predicate);
  }

  @Override
  public void pipe_(X x, Sink sink) {
    if ( ! ( sink instanceof AuthenticatedSink ) ) {
      sink = new AuthenticatedSink(name_, "pipe", sink);
    }
    super.pipe_(x, sink);
  }
}