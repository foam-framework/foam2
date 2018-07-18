/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import java.security.AccessControlException;

public class InvalidX
  extends AbstractX
{
  private static X x_ = new InvalidX();

  private InvalidX() {}

  public static X instance() {
    return x_;
  }

  public Object get(X x, Object key) {
    throw getException();
  }

  public X put(Object key, Object value) {
    throw getException();
  }

  public X putFactory(Object key, XFactory factory) {
    throw getException();
  }

  @Override
  public String toString() {
    throw getException();
  }

  private AccessControlException getException() {
    return new AccessControlException("When using a DAO decorated by " +
        "AuthenticatedDAO, you may only call the context-oriented methods: " +
        "put_(), find_(), select_(), remove_(), removeAll_(), pipe_(), and " +
        "listen_(). Alternatively, you can also use .inX() to set the " +
        "context on the DAO.");
  }
}
