/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import foam.core.X;

import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;

public class UptimeWebAgent
    implements WebAgent
{
  protected long startTime_ = System.currentTimeMillis();

  @Override
  public void execute(X x) {
    PrintWriter out = x.get(PrintWriter.class);
    HttpServletResponse response = x.get(HttpServletResponse.class);
    response.setContentType("text/html");
    out.println("Uptime: " + ( System.currentTimeMillis() - startTime_ ) / 1000);
  }
}
