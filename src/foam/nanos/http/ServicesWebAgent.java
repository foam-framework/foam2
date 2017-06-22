/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import foam.core.*;
import java.io.PrintWriter;

public class ServicesWebAgent
  implements WebAgent
{
  public ServicesWebAgent() {}

  public void execute(X x) {
    PrintWriter out = (PrintWriter) x.get(PrintWriter.class);

    out.println("servcies");
  }
}
