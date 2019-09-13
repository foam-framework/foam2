/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.auth;

import foam.core.FObject;
import foam.core.X;

/**
 * An authorizer is a class that can check if a user has access to an FObject
 * under different circumstances.
 */
public interface Authorizer {
  void authorizeOnCreate(X x, FObject obj) throws AuthorizationException;
  void authorizeOnRead(X x, FObject obj) throws AuthorizationException;
  void authorizeOnUpdate(X x, FObject oldObj, FObject newObj) throws AuthorizationException;
  void authorizeOnDelete(X x, FObject obj) throws AuthorizationException;
  boolean checkGlobalRead(X x);
  boolean checkGlobalRemove(X x);
}
