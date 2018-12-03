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

  public AuthorizationSink(X x, Authorizer authorizer, Sink delegate) {
    super(x, delegate);
    authorizer_ = authorizer;
  }

  @Override
  public void put(Object obj, Detachable sub) {
    try {
      authorizer_.authorizeOnRead(getX(), (FObject) obj);
      super.put(obj, sub);
    } catch ( AuthorizationException e ) {
      // Do not put to sink if not authorized to read this object.
    }
  }

  @Override
  public void remove(Object obj, Detachable sub) {
    try {
      authorizer_.authorizeOnDelete(getX(), (FObject) obj);
      super.remove(obj, sub);
    } catch ( AuthorizationException e ) {
      // Do not remove from sink if not authorized to delete this object.
    }
  }
}
