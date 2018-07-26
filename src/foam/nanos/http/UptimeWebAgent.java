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
    PrintWriter         out      = x.get(PrintWriter.class);
    HttpServletResponse response = x.get(HttpServletResponse.class);
    long                gap      = System.currentTimeMillis()-startTime_;

    response.setContentType("text/plain");

    out.println(
      gap + "\n\n" +
      "Uptime: \n" +
      "  Days: " + gap / (1000*60*60*24) + "\n" +
      "  Hours: " + (gap % (1000*60*60*24)) / (1000*60*60) + "\n" +
      "  Minutes: "+ (gap % (1000*60*60)) /(1000*60) + "\n" +
      "  Seconds: "+ (gap % (1000*60))/ 1000
    );
  }
}
