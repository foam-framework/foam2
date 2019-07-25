/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import foam.core.Detachable;
import foam.core.FObject;
import foam.core.X;
import foam.nanos.auth.AuthorizationException;
import foam.nanos.auth.Authorizer;

public class AuthorizationSink
  extends ProxySink
{
  public Authorizer authorizer_;
  public Boolean    checkDelete_;

  public AuthorizationSink(X x, Authorizer authorizer, Sink delegate) {
    this(x, authorizer, delegate, false);
  }

  public AuthorizationSink(X x, Authorizer authorizer, Sink delegate, Boolean checkDelete) {
    super(x, delegate);
    authorizer_  = authorizer;
    checkDelete_ = checkDelete;
  }

  @Override
  public void put(Object obj, Detachable sub) {
    Boolean authorized = true;

    try {
      if ( checkDelete_ ) {
        authorizer_.authorizeOnDelete(getX(), (FObject) obj);
      } else {
        authorizer_.authorizeOnRead(getX(), (FObject) obj);
      }
    } catch ( AuthorizationException e ) {
      authorized = false;
    }

    // The reason this isn't just at the end of the try block above is because
    // if a sink down the delegate chain wants to throw an
    // AuthorizationException, we don't want it to be caught and ignored. We
    // only want to catch and ignore AuthorizationExceptions thrown by
    // `authorizeOnRead` and `authorizeOnDelete`.
    if ( authorized ) super.put(obj, sub);
  }
}
