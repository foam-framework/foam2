/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import foam.core.*;
import java.io.PrintWriter;
import java.util.Date;

public class PingService
  implements WebAgent
{
  public PingService() {}

  @Override
  public void execute(X x) {
    PrintWriter out = x.get(PrintWriter.class);
    out.println("Pong: " + new Date());
  }
}
