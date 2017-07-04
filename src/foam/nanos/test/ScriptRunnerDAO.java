/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.test;

import foam.core.*;
import foam.dao.*;
import java.io.IOException;

public class ScriptRunnerDAO
  extends foam.nanos.script.ScriptRunnerDAO
{
  public ScriptRunnerDAO()
    throws IOException
  {
    super(new JDAO(Test.getOwnClassInfo(), "tests"));
  }
}
