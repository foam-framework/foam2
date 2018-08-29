/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import foam.core.FObject;
import foam.core.InvalidX;
import foam.core.X;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.AuthorizationException;

/** Authenticate access to a DAO. **/
public class AuthenticatedDAO
  extends ProxyDAO
{
  protected String  name_;
  protected boolean authenticateRead_;

  public AuthenticatedDAO(String name, DAO delegate) {
    this(name, true, delegate);
  }

  public AuthenticatedDAO(String name, boolean authenticateRead, DAO delegate) {
    this.name_             = name;
    this.authenticateRead_ = authenticateRead;
    AuthorizationException exception = new AuthorizationException("When " +
        "using a DAO decorated by AuthenticatedDAO, you may only call the " +
        "context-oriented methods: put_(), find_(), select_(), remove_(), " +
        "removeAll_(), pipe_(), and listen_(). Alternatively, you can also " +
        "use .inX() to set the context on the DAO.");
    setX(new InvalidX(exception));
    setDelegate(delegate);
  }

  public void setAuthenticateRead(boolean authenticateRead) {
    this.authenticateRead_ = authenticateRead;
  }

  public String createPermission(String op) {
    return name_ + "." + op;
  }

  public String createPermission(String op, Object id) {
    return name_ + "." + op + "." + id;
  }

  @Override
  public FObject put_(X x, FObject obj) {
    String      permission;
    AuthService authService = (AuthService) x.get("auth");

    Object id = obj.getProperty("id");

    if ( id == null || getDelegate().find(id) == null ) {
      permission = createPermission("create");
    } else {
      permission = createPermission("update", id);
    }

    if ( ! authService.check(x, permission) ) {
      throw new AuthorizationException();
    }

    return super.put_(x, obj);
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    String      permission  = createPermission("remove", obj.getProperty("id"));
    AuthService authService = (AuthService) x.get("auth");

    if ( ! authService.check(x, permission) ) {
      throw new AuthorizationException();
    }

    return super.remove_(x, obj);
  }

  @Override
  public FObject find_(X x, Object id) {
    if ( authenticateRead_ ) {
      String permission = createPermission("read", id);
      AuthService authService = (AuthService) x.get("auth");

      if ( ! authService.check(x, permission) ) {
        throw new AuthorizationException();
      }
    }

    return super.find_(x, id);
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    if ( authenticateRead_ ) {
      super.select_(x, new AuthenticatedSink(x, createPermission("read"), sink), skip, limit, order, predicate);
      return sink;
    }
    return super.select_(x, sink, skip, limit, order, predicate);
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    Sink sink = new AuthenticatedSink(x, createPermission("delete"), new RemoveSink(x, this));
    this.select_(x, sink, skip, limit, order, predicate);
  }

  @Override
  public void listen_(X x, Sink sink, Predicate predicate) {
    sink = new AuthenticatedSink(x, createPermission("listen"), sink);
    super.listen_(x, sink, predicate);
  }

  @Override
  public void pipe_(foam.core.X x, foam.dao.Sink sink, foam.mlang.predicate.Predicate predicate) {
    sink = new AuthenticatedSink(x, createPermission("pipe"), sink);
    super.pipe_(x, sink, null);
  }
}
