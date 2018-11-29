/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.auth;

import foam.core.FObject;
import foam.core.X;

/**
 * A model should implement this interface if it is authorizable, meaning some
 * users are allowed to operate on (create, read, update, or delete) that object
 * but others are not.
 */
public interface Authorizable {
  void authorizeOnCreate(X x) throws AuthorizationException;
  void authorizeOnRead(X x) throws AuthorizationException;
  void authorizeOnUpdate(X x, FObject oldObj) throws AuthorizationException;
  void authorizeOnDelete(X x) throws AuthorizationException;
}
