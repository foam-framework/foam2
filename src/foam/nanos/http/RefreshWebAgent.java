/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import foam.core.*;
import foam.mlang.predicate.And;
import foam.mlang.predicate.Predicate;
import foam.mlang.order.Comparator;
import java.io.PrintWriter;
import foam.dao.Sink;
import foam.nanos.http.WebAgent;
import foam.nanos.http.ProxyWebAgent;
import javax.servlet.http.HttpServletRequest;
import java.lang.Thread;
import java.util.TimerTask;
import java.util.Timer;

public class RefreshWebAgent
  extends ProxyWebAgent
{
  public RefreshWebAgent(WebAgent delegate) {
    setDelegate(delegate);
  }

  public void execute(X x) {
    final PrintWriter out = (PrintWriter) x.get(PrintWriter.class);
    HttpServletRequest req     = (HttpServletRequest) x.get(HttpServletRequest.class);
    String json = req.getParameter("refresh");

    out.println("<pre>");
    out.println("<form>");
    out.println("<label>Refresh Rate (sec):</label>");
    out.println("<input name=\"refresh\" type=\"number\" value=\"refresh\" style=\"width:150px;display:inline-block;\"></input>");
    out.println("<button type=submit style=\"display:inline-block;margin-top:10px;\";>Set Refresh</button>");
    out.println("</form>");
    out.println("</pre>");

    if( json != null || !"".equals(json)){
      int refresh = Integer.parseInt(json);
      out.println("<script>");
      out.println("setTimeout(function(){ window.location.href = window.location.href; }, "+ refresh * 1000 + "); ");
      out.println("</script>");
    }

    getDelegate().execute(x);
  }
}