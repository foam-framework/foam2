/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

public interface ContextFactory<T> {
  public T getInstance(java.util.Map<String, Object> args, X x);
}

