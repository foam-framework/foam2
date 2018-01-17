/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.script;

import foam.core.*;
import foam.dao.*;
import java.io.IOException;

public class ScriptRunnerDAO
  extends ProxyDAO
{

  public ScriptRunnerDAO(DAO delegate) {
    super();
    setDelegate(delegate);
  }

  public FObject put_(X x, FObject obj) {
    Script script = (Script) obj;

    try {
      if ( script.getScheduled() ) {
        script.runScript(x);
        script.setScheduled(false);
      }
    } catch (Throwable t) {
      t.printStackTrace();
    }

    return getDelegate().put_(x, obj);
  }
}
