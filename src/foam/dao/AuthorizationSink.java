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
  public Boolean checkDelete_;

  public AuthorizationSink(X x, Authorizer authorizer, Sink delegate) {
    this(x, authorizer, delegate, false);
  }

  public AuthorizationSink(X x, Authorizer authorizer, Sink delegate, Boolean checkDelete) {
    super(x, delegate);
    authorizer_ = authorizer;
    checkDelete_ = checkDelete;
  }

  @Override
  public void put(Object obj, Detachable sub) {
    try {
      if ( checkDelete_ ) {
        authorizer_.authorizeOnDelete(getX(), (FObject) obj);
      } else {
        authorizer_.authorizeOnRead(getX(), (FObject) obj);
      }
      super.put(obj, sub);
    } catch ( AuthorizationException e ) {
      // Do not put to sink if not authorized.
    }
  }
}
