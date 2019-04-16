
//
//  ========================================================================
//  WE NEED TO FIGURE OUT WHICH COPYRIGHT GOES HERE
//  ------------------------------------------------------------------------
//  TBD NEED TO FINALIZE WHAT COPYRIGHT BLOCK GOES UP HERE
//  ========================================================================
//

package foam2.src.foam.nanos.jetty;

import org.eclipse.jetty.http.*;
import org.eclipse.jetty.server.Connector;
import org.eclipse.jetty.server.ForwardedRequestCustomizer;
import org.eclipse.jetty.server.HttpConfiguration;
import org.eclipse.jetty.server.Request;
import org.eclipse.jetty.util.HostPort;
import org.eclipse.jetty.util.log.Log;
import org.eclipse.jetty.util.log.Logger;

import java.net.InetSocketAddress;
import java.util.Set;

public class WhitelistedForwardedRequestCustomizer extends ForwardedRequestCustomizer
{
  private static final Logger LOG = Log.getLogger(ForwardedRequestCustomizer.class);

  private String _forwardedForHeader = HttpHeader.X_FORWARDED_FOR.toString();
  private Set<String> forwardedForProxyWhitelist;

  /**
   * Making a constructor which can take in an set of whitelisted IP addresses
   * @param forwardedForProxyWhitelist a set of whitelisted IP addresses
   */
  public WhitelistedForwardedRequestCustomizer( Set<String> forwardedForProxyWhitelist ) {
    super();
    this.forwardedForProxyWhitelist = forwardedForProxyWhitelist;
  }

  /**
   *
   * @param connector
   * @param config
   * @param request
   */
  @Override
  public void customize(Connector connector, HttpConfiguration config, Request request)
  {
    // grabbing the X-Forwarded-For header in the form of a HostPort object
    HostPort forwardedFor = getRemoteAddr(_forwardedForHeader);

    if (forwardedFor != null)
    {
      // TODO: do the check here
      if ( this.forwardedForProxyWhitelist.contains(request.getRemoteAddr()) ) {
        LOG.info("SUCCESS: Proxy IP is on the whitelist", request.getRemoteAddr());
        request.setRemoteAddr(InetSocketAddress.createUnresolved(forwardedFor.getHost(), (forwardedFor.getPort() > 0) ? forwardedFor.getPort() : request.getRemotePort()));
        LOG.info("SUCCESS: New remote address is: ", request.getRemoteAddr());
      } else {
        LOG.info("FAILURE: Proxy IP is NOT on the whitelist");
        LOG.info("FAILURE: Unauthorized proxy remote address is: ", request.getRemoteAddr());
      }
    }
  }

  /* ------------------------------------------------------------ */

  /**
   * NOTE: might have to override this in the future as it appears in the API docs but not in this project
   * @param headerValue
   * @return
   */
  protected HostPort getRemoteAddr(String headerValue)
  {
    String leftMost = super.getLeftMost(headerValue);
    if (leftMost == null)
    {
      return null;
    }

    try
    {
      return new HostPort(leftMost);
    }
    catch (Exception e) {
      // failed to parse in host[:port] format
      LOG.ignore(e);
      return null;
    }
  }
}
