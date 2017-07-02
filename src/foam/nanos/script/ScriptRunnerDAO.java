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

  public ScriptRunnerDAO()
    throws IOException
  {
    this(new JDAO(Script.getOwnClassInfo(), "tests"));
  }

  public ScriptRunnerDAO(DAO delegate) {
    super(delegate);
  }

  public FObject put_(X x, FObject obj) {
    Script script = (Script) obj;

    if ( script.getScheduled() ) script.runScript();

    return getDelegate().put_(x, obj);
  }
}
