/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

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
import java.util.regex.Pattern;

/**
 * A whitelist-featured customizer which looks at an HTTP request for headers which indicate it
 * has been forwarded by one or more proxies. Currently, this customizer can only the handle X-Forwarded-For
 *
 * If a whitelist is set up and the X-Forwarded-For header exists:
 *    the customizer will then check most recent IP address of the request against the whitelist and if it does pass,
 *    the remoteAddress of the request will be set to the address in X-Forwarded-For.
 * If a whitelist is not set and the X-Forwarded0For header exists:
 *    the customizer will log the IP address of the request and fail the request
 * If NO whitelist is set up:
 *    then all requests with the X-Forwarded-For header will have their remoteAddress set to the address in X-Forwarded-For
 * Requests WITHOUT the X-Forwarded-For header will be unaffected by this customizer
 *
 * For more info on X-Forwarded-For:
 * @see <a href="http://en.wikipedia.org/wiki/X-Forwarded-For">Wikipedia: X-Forwarded-For</a>
 *
 * For implementation of ForwardedRequestCustomizer as per Jetty version 9.4.x:
 * @see <a href="https://github.com/eclipse/jetty.project/blob/jetty-9.4.x/jetty-server/src/main/java/org/eclipse/jetty/server/ForwardedRequestCustomizer.java">Jetty: ForwardedRequestCustomizer</a>
 */
public class WhitelistedForwardedRequestCustomizer extends ForwardedRequestCustomizer
{
  private static final Logger LOG = Log.getLogger(ForwardedRequestCustomizer.class);

  private String _forwardedForHeader = HttpHeader.X_FORWARDED_FOR.toString();
  private Set<String> forwardedForProxyWhitelist;

  // these are patterns being declared here to handle proper normalization of IPv6 addresses
  private static final Pattern IPV6_STD_PATTERN = Pattern.compile("^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$");
  private static final Pattern IPV6_HEX_COMPRESSED_PATTERN = Pattern.compile("^((?:[0-9A-Fa-f]{1,4}(?::[0-9A-Fa-f]{1,4})*)?)::((?:[0-9A-Fa-f]{1,4}(?::[0-9A-Fa-f]{1,4})*)?)$");

  /**
   * A constructor which can take in an Set of whitelisted Proxy IP Addresses
   * @param forwardedForProxyWhitelist a set of whitelisted IP addresses
   */
  public WhitelistedForwardedRequestCustomizer( Set<String> forwardedForProxyWhitelist ) {
    super();
    this.forwardedForProxyWhitelist = forwardedForProxyWhitelist;
  }

  /**
   * The actual customizer to pass each request through to handle proxied requests
   * @param connector the connector which accepts connection and data from remote peers
   * @param config the holder of HTTP configuration to be passed into a ConnectionFactory
   * @param request a request created for each connection accepted by the Jetty server
   */
  @Override
  public void customize(Connector connector, HttpConfiguration config, Request request)
  {
    // grabbing the X-Forwarded-For header in the form of a HostPort object
    HostPort forwardedFor = convertAddressToHostPort(request.getHeader(_forwardedForHeader));

    // TODO: Use the foam logger
    if ( forwardedFor != null ) {

      // if whitelist is not yet configured (i.e. whitelist array is empty)
      // then we will configure X-Forwarded-For to work with all requests that flow through
      if ( this.forwardedForProxyWhitelist.isEmpty() ){
        System.out.printf("SUCCESS: Whitelist is not configured and so request will pass %s %n", request.getRemoteAddr());

        String forwardedForHost = forwardedFor.getHost();
        int forwardedForPort = (forwardedFor.getPort() > 0) ? forwardedFor.getPort() : request.getRemotePort();

        request.setRemoteAddr(InetSocketAddress.createUnresolved(forwardedForHost, forwardedForPort));

        System.out.printf("SUCCESS: New remote address is: %s %n", request.getRemoteAddr());
        System.out.printf("SUCCESS: New remote port is: %i %n", request.getRemotePort());


      } else if ( this.forwardedForProxyWhitelist.contains(request.getRemoteAddr()) ) {
        System.out.printf("SUCCESS: Proxy IP is on the whitelist %s %n", request.getRemoteAddr());

        String forwardedForHost = forwardedFor.getHost();

        int forwardedForPort = (forwardedFor.getPort() > 0) ? forwardedFor.getPort() : request.getRemotePort();

        request.setRemoteAddr(InetSocketAddress.createUnresolved(forwardedForHost, forwardedForPort));
        
        System.out.printf("SUCCESS: New remote address is: %s %n", request.getRemoteAddr());
        System.out.printf("SUCCESS: New remote port is: %i %n", request.getRemotePort());
      } else {
        System.out.printf("FAILURE: Proxy IP is NOT on the whitelist %n");
        System.out.printf("FAILURE: Unauthorized proxy remote address is: %s %n", request.getRemoteAddr());

        throw new Error("failing the whitelist");
      }
    }
  }

  /* ------------------------------------------------------------ */

  /**
   * This function is made to get the left most header value from the X-Forwarded-For header
   * in the case that it was sent through numerous proxies like so (X-Forwarded-For: 203.0.113.195, 70.41.3.18, 150.172.238.178)
   * and finally convert it into a HostPort object
   * @param headerValue the header value to parse the source IP address from
   * @return a HostPort object with the left most value from headerValue
   */
  private HostPort convertAddressToHostPort(String headerValue)
  {
    String leftMost = super.getLeftMost(headerValue);
    if (leftMost == null)
    {
      return null;
    }

    /**
     * If we have an IPv6 address with no square brackets or port 
     * we need to format it accordingly before sending it to HostPort
     * 
     * Currently Jetty doesn't consider the case of when they receive an IPv6 address with no square brackets and port
     * This is a problem because AWS injects X-Forwarded-For headers like so: 2001:DB8::21f:5bff:febf:ce22:8a2e
     * 
     * As a cause if we just inject this string as is, the last octet gets truncated because the program thinks its the port
     * the address will end up like so: 2001:DB8::21f:5bff:febf:ce22
     * 
     * For more info on X-Forwarded-Header functionality with AWS Load Balancers:
     * @see <a href="https://docs.aws.amazon.com/elasticloadbalancing/latest/classic/x-forwarded-headers.html#x-forwarded-for">AWS: X-Forwarded-Headers</a>
     * 
     * Until this is fixed, what we will do instead of creating another class is first detect if these naked ipv6 addresses exist in the header
     * Then we will parse it accordingly into square brackets: [2001:DB8::21f:5bff:febf:ce22:8a2e]
     * We are normalizing the IPv6 address as per rfc2732
     * @see <a href="https://www.ietf.org/rfc/rfc2732.txt">Noramalized IPv6</a>
     * 
     * By default the port will be set to 0 for addresses with no ports specified
     * 
     * The address will appear like so [2001:DB8::21f:5bff:febf:ce22:8a2e] with the square brackets attached
     * This is fine according to http://support.sas.com/documentation/cdl/en/lrcon/62955/HTML/default/viewer.htm#a003165928.htm
     * As the square brackets are OPTIONAL if you do not specify a port number
     * 
     * Just for reference, a properly structured ipv6 address with ports should look like this: [2001:DB8::21f:5bff:febf:ce22:8a2e]:60
     * If in the future we get X-Forwarded-For headers injected in this style, it should be handled normally by HostPort
     */
    if (isIPv6HexCompressedAddress(leftMost) || isIPv6StdAddress(leftMost)) {
      // we need to enclose the string with square brackets
      StringBuffer ipv6Formatted = new StringBuffer(leftMost);
      ipv6Formatted.append(']');
      ipv6Formatted.insert(0, '[');

      // resetting left most to this new string
      leftMost = ipv6Formatted.toString();
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

  private static boolean isIPv6StdAddress(final String input) {
    return IPV6_STD_PATTERN.matcher(input).matches();
  }
       
  private static boolean isIPv6HexCompressedAddress(final String input) {
    return IPV6_HEX_COMPRESSED_PATTERN.matcher(input).matches();
  }
}
