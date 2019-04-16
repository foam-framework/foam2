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
   * A constructor which can take in an Set of whitelisted Proxy IP Addresses
   * @param forwardedForProxyWhitelist a set of whitelisted IP addresses
   */
  public WhitelistedForwardedRequestCustomizer( Set<String> forwardedForProxyWhitelist ) {
    super();
    this.forwardedForProxyWhitelist = forwardedForProxyWhitelist;
  }

  /**
   * A customizer which looks at an HTTP request for headers which indicate it has been forwarded by one or more proxies
   * Currently, this customizer can only handle X-Forwarded-For
   * If a whitelist is set up and the X-Forwarded-For header exists, the customizer will then check most recent IP address of the request
   * against the whitelist and if it does pass, the remoteAddress of the request will be set to the address in X-Forwarded-For.
   * If a whitelist is not set and the X-Forwarded0For header exists, the customizer will log the IP address of the request and fail the request
   * If NO whitelist is set up, then all requests with the X-Forwarded-For header will have their remoteAddress set to the address in X-Forwarded-For
   * Requests without the X-Forwarded-For header will simply go through normally
   * For more info on X-Forwarded-For:
   * @see http://en.wikipedia.org/wiki/X-Forwarded-For" 
   * For implementation of ForwardedRequestCustomizer as per Jetty version 9.4.x:
   * @see https://github.com/eclipse/jetty.project/blob/jetty-9.4.x/jetty-server/src/main/java/org/eclipse/jetty/server/ForwardedRequestCustomizer.java
   * 
   * @param connector the connector which accepts connection and data from remote peers
   * @param config the holder of HTTP configuration to be passed into a ConnectionFactory
   * @param request a request created for each connection accepted by the Jetty server
   */
  @Override
  public void customize(Connector connector, HttpConfiguration config, Request request)
  {
    // grabbing the X-Forwarded-For header in the form of a HostPort object
    HostPort forwardedFor = getRemoteAddr(request.getHeader(_forwardedForHeader));

    // TODO: Use FOAM logger
    if ( forwardedFor != null ) {

      // if whitelist is not yet configured (i.e. whitelist array is empty)
      // then we will configure X-Forwarded-For to work with all requests that flow through
      if ( this.forwardedForProxyWhitelist.isEmpty() ){
        System.out.printf("SUCCESS: Whitelist is not configured and so request will pass %s %n", request.getRemoteAddr());
        request.setRemoteAddr(InetSocketAddress.createUnresolved(forwardedFor.getHost(), (forwardedFor.getPort() > 0) ? forwardedFor.getPort() : request.getRemotePort()));
        System.out.printf("SUCCESS: New remote address is: %s %n", request.getRemoteAddr());

      } else if ( this.forwardedForProxyWhitelist.contains(request.getRemoteAddr()) ) {
        System.out.printf("SUCCESS: Proxy IP is on the whitelist %s %n", request.getRemoteAddr());
        request.setRemoteAddr(InetSocketAddress.createUnresolved(forwardedFor.getHost(), (forwardedFor.getPort() > 0) ? forwardedFor.getPort() : request.getRemotePort()));
        System.out.printf("SUCCESS: New remote address is: %s %n", request.getRemoteAddr());

      } else {
        System.out.printf("FAILURE: Proxy IP is NOT on the whitelist %n");
        System.out.printf("FAILURE: Unauthorized proxy remote address is: %s %n", request.getRemoteAddr());
      }
    }
  }

  /* ------------------------------------------------------------ */

  /**
   * NOTE: might have to override this in the future as it appears in the API docs but not in this project
   * This function is made to get the left most header value from the X-Forwarded-For header
   * in the case that it was sent through numerous proxies
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
