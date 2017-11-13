/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.auth;

import foam.core.Detachable;
import foam.core.FObject;
import foam.core.X;
import foam.dao.ProxySink;
import foam.dao.Sink;

public class PasswordRemovalSink
    extends ProxySink
{
  public PasswordRemovalSink(X x, Sink delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public void put(FObject obj, Detachable sub) {
    FObject clone = obj.fclone();
    clone.setProperty("password", null);
    clone.setProperty("previousPassword", null);
    clone.setProperty("passwordLastModified", null);
    super.put(clone, sub);
  }
}