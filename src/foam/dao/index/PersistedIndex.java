/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao.index;

import java.io.File;
import java.io.IOException;

public class PersistedIndex
    extends ProxyIndex
{
  protected File file_;

  public PersistedIndex(String filename, Index index) throws IOException {
    this.file_ = new File(filename).getAbsoluteFile();
    if ( ! file_.exists() ) {
      this.file_.createNewFile();
    }
    setDelegate(index);
  }

  @Override
  public Object wrap(Object state) {
    return super.wrap(state);
  }

  @Override
  public Object unwrap(Object state) {
    return super.unwrap(state);
  }
}