/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao.index;

import java.io.IOException;

public abstract class AbstractIndex
  implements Index
{
  public Object wrap(Object state) {
    return state;
  }

  public Object unwrap(Object state) {
    return state;
  }

  public void flush(Object state) throws IOException {

  }
}
