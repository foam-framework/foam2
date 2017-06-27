/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import foam.core.*;
import foam.dao.DAO;
import foam.dao.AbstractSink;
import foam.nanos.boot.NSpec;
import java.io.PrintWriter;

public class ServicesWebAgent
  implements WebAgent
{
  public ServicesWebAgent() {}

  public void execute(X x) {
    final PrintWriter out  = (PrintWriter) x.get(PrintWriter.class);
          DAO         dao  = (DAO)         x.get("nSpecDAO");

    out.println("<pre>");
    dao.select(new AbstractSink() {
      public void put(FObject o, Detachable d) {
        NSpec s = (NSpec) o;
        out.println(s.getName() + (s.getServe() ? " (S)" : ""));
      }
    });
    out.println("</pre>");
  }
}
