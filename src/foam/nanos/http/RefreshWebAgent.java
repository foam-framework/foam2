/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import foam.core.*;
import foam.nanos.http.ProxyWebAgent;
import foam.nanos.http.WebAgent;
import java.io.PrintWriter;
import javax.servlet.http.HttpServletRequest;

public class RefreshWebAgent
  extends ProxyWebAgent
{
  public RefreshWebAgent(WebAgent delegate) {
    setDelegate(delegate);
  }

  public void execute(X x) {
    PrintWriter        out  = x.get(PrintWriter.class);
    HttpServletRequest req  = x.get(HttpServletRequest.class);
    String             json = req.getParameter("refresh");
    int                refresh = json == null || "".equals(json) ? -1 : Integer.parseInt(json);

    out.println("<form>");
    out.println("<label>Refresh Rate (sec):</label>");
    out.println("<input name=\"refresh\" type=\"number\" value=\"" + ( refresh == -1 ? "" : ""+refresh) + "\" style=\"width:100px;display:inline-block;\"></input>");
    out.println("<button type=submit style=\"display:inline-block;margin-top:10px;\";>Set Refresh</button>");
    out.println("</form>");

    getDelegate().execute(x);

    if ( refresh != -1 ) {
      out.println("<script>");
      out.println("setTimeout(function(){ window.location.href = window.location.href; }, "+ refresh * 1000 + "); ");
      out.println("</script>");
    }
  }
}
