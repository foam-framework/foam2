/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.auth;

import foam.core.FObject;
import foam.core.InvalidX;
import foam.core.X;
import foam.dao.*;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.AuthorizationException;
import foam.nanos.auth.User;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.HAS_PERMISSION;

/**
 * A DAO decorator to run authorization checks.
 */
public class AuthorizationDAO extends ProxyDAO {
  protected Authorizer authorizer_;
  protected boolean authorizeRead_ = false;

  public AuthorizationDAO(X x, DAO delegate, Authorizer authorizer) {
    this(x, delegate, authorizer, true);
  }

  public AuthorizationDAO(X x, DAO delegate, Authorizer authorizer, boolean authorizeRead) {
    AuthorizationException exception = new AuthorizationException("When " +
        "using a DAO decorated by AuthenticatedDAO, you may only call the " +
        "context-oriented methods: put_(), find_(), select_(), remove_(), " +
        "removeAll_(), pipe_(), and listen_(). Alternatively, you can also " +
        "use .inX() to set the context on the DAO.");
    setX(new InvalidX(exception));
    setDelegate(delegate);
    authorizer_ = authorizer;
    authorizeRead_ = authorizeRead;
  }

  @Override
  public FObject put_(X x, FObject obj) throws AuthorizationException {

    if ( obj == null ) throw new RuntimeException("Cannot put null.");

    Object id = obj.getProperty("id");
    FObject oldObj = getDelegate().find(id);
    boolean isCreate = id == null || oldObj == null;

    if ( isCreate ) {
      authorizer_.authorizeOnCreate(x, obj);
    } else {
      authorizer_.authorizeOnUpdate(x, oldObj, obj);
    } 

    return super.put_(x, obj);
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    authorizer_.authorizeOnDelete(x, obj);
    return super.remove_(x, obj);
  }

  @Override
  public FObject find_(X x, Object id) {

    if ( ! authorizeRead_ ) return super.find_(x, id);

    FObject obj = super.find_(x, id);
    if ( id == null || obj == null ) return null;
    authorizer_.authorizeOnRead(x, obj);
    return obj;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) { // TODO augmentPredicate
    if ( ! authorizeRead_ || authorizer_.checkGlobalRead(x) ) super.select_(x, sink, skip, limit, order, predicate);
    else super.select_(x, new AuthorizationSink(x, authorizer_, sink), skip, limit, order, predicate);

    return sink;
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) { // TODO augmentPredicate
    Sink sink;
    if ( ! authorizer_.checkGlobalRemove(x) ) sink = new AuthorizationSink(x, authorizer_, new RemoveSink(x, getDelegate()), true);
    else sink = new RemoveSink(x, getDelegate());
    getDelegate().select_(x, sink, skip, limit, order, predicate);
  }

  public String createPermission(String op) {
    return authorizer_.getPermissionPrefix() + "." + op;
  }

  // TODO this needs to be change to take authorizer since the permissions for custom authorizables are not checked correctly
  public Predicate augmentPredicate(X x, Predicate existingPredicate, String operation) {
    return existingPredicate != null ?
      AND(
        HAS_PERMISSION(x, createPermission(operation)),
        existingPredicate
      ) :
      HAS_PERMISSION(x, createPermission(operation));
  }
}
