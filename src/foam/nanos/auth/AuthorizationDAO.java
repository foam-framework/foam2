/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.auth;

import foam.core.FObject;
import foam.core.X;
import foam.dao.*;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;

/**
 * A DAO decorator to run authorization checks.
 */
public class AuthorizationDAO extends ProxyDAO {
  public Authorizer authorizer_;

  public AuthorizationDAO(X x, DAO delegate) {
    this(x, delegate, AuthorizableAuthorizer.instance());
  }

  public AuthorizationDAO(X x, DAO delegate, Authorizer authorizer) {
    setX(x);
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
    FObject obj = super.find_(x, id);
    if ( id == null || obj == null ) return null;
    authorizer_.authorizeOnRead(x, obj);
    return obj;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    super.select_(x, new AuthorizationSink(x, authorizer_, sink), skip, limit, order, predicate);
    return sink;
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    Sink sink = new AuthorizationSink(x, authorizer_, new RemoveSink(x, getDelegate()), true);
    getDelegate().select_(x, sink, skip, limit, order, predicate);
  }
}
