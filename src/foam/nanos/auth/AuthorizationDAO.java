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
import static foam.mlang.MLang.IS_AUTHORIZED_TO_READ;
import static foam.mlang.MLang.IS_AUTHORIZED_TO_DELETE;

/**
 * A DAO decorator to run authorization checks.
 */
public class AuthorizationDAO extends ProxyDAO {
  protected Authorizer authorizer_;
  
  public AuthorizationDAO(X x, DAO delegate, Authorizer authorizer) {
    AuthorizationException exception = new AuthorizationException("When " +
        "using a DAO decorated by AuthorizationDAO, you may only call the " +
        "context-oriented methods: put_(), find_(), select_(), remove_(), " +
        "removeAll_(). Alternatively, you can also " +
        "use .inX() to set the context on the DAO.");
    setX(new InvalidX(exception));
    setDelegate(delegate);
    authorizer_ = authorizer;
  }

  @Override
  public FObject put_(X x, FObject obj) throws AuthorizationException {

    if ( obj == null ) throw new RuntimeException("Cannot put null.");

    Object id = obj.getProperty("id");
    FObject oldObj = getDelegate().inX(x).find(id);
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
    Object id = obj.getProperty("id");
    FObject oldObj = getDelegate().inX(x).find(id);
    if ( id == null || oldObj == null ) return null;
    authorizer_.authorizeOnDelete(x, oldObj);
    return super.remove_(x, obj);
  }

  @Override
  public FObject find_(X x, Object id) {
    if ( id == null ) return null;
    if ( authorizer_.checkGlobalRead(x) ) return super.find_(x, id);

    FObject obj = super.find_(x, id);
    if ( obj != null ) authorizer_.authorizeOnRead(x, obj);
    return obj;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) { 

    if ( ! authorizer_.checkGlobalRead(x) ) predicate = augmentPredicate(x, false, predicate);
    return super.select_(x, sink, skip, limit, order, predicate);
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) { 
    if ( ! authorizer_.checkGlobalRemove(x) ) predicate = augmentPredicate(x, true, predicate);
    this.select_(x, new RemoveSink(x, this), skip, limit, order, predicate);
  }

  public Predicate augmentPredicate(X x, boolean remove, Predicate existingPredicate) {
    Predicate newPredicate = remove ? IS_AUTHORIZED_TO_DELETE(x, authorizer_) : IS_AUTHORIZED_TO_READ(x, authorizer_);
    return existingPredicate != null ?
      AND(
        existingPredicate,
        newPredicate
      ) :
      newPredicate;
  }
}
