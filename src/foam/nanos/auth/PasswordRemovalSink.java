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
import foam.util.Password;

public class PasswordRemovalSink
    extends ProxySink
{
  public PasswordRemovalSink(X x, Sink delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public void put(Object obj, Detachable sub) {
    super.put(Password.sanitize((FObject)obj), sub);
  }
}
