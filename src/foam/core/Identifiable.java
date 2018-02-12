/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

// Any object that has a primary key.
public interface Identifiable {
  public Object getPrimaryKey();
}
