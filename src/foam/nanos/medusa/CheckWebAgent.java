/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.medusa;

import foam.core.X;
import foam.nanos.http.WebAgent;
import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;

/**
   Health check web agent, intented to be called by load balancers
   to add/remove targets from target group.
   Responses from haproxy.org
 */
public class CheckWebAgent
  implements WebAgent
{
  @Override
  public void execute(X x) {
    PrintWriter         out      = x.get(PrintWriter.class);
    HttpServletResponse response = x.get(HttpServletResponse.class);

    response.setContentType("text/plain");

    ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
    ElectoralService electoral = (ElectoralService) x.get("electoralService");
2
    if ( support != null ) {
      ClusterConfig config = support.getConfig(x, support.getConfigId());
      if ( config.getStatus() != Status.ONLINE ||
           electoral.getStatus() != ElectoralServiceStatus.IN_SESSION ) {
        response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
        out.println("maint\n");
        return;
      }
    }
    response.setStatus(HttpServletResponse.SC_OK);
    out.println("up\n");
  }
}
