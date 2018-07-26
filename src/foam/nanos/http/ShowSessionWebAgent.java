/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import foam.core.X;
import foam.nanos.session.Session;
import java.io.PrintWriter;
import javax.servlet.http.HttpServletResponse;

public class ShowSessionWebAgent
  implements WebAgent
{
  @Override
  public void execute(X x) {
    PrintWriter         out      = x.get(PrintWriter.class);
    HttpServletResponse response = x.get(HttpServletResponse.class);
    Session             session  = x.get(Session.class);

    response.setContentType("text/plain");

    out.println(session.getId());
  }
}
