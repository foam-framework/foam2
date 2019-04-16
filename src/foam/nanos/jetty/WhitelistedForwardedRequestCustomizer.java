package foam2.src.foam.nanos.jetty;

import org.eclipse.jetty.http.HttpFields;
import foam.util.SafetyUtil;
import org.eclipse.jetty.server.Connector;
import org.eclipse.jetty.server.ForwardedRequestCustomizer;
import org.eclipse.jetty.server.HttpConfiguration;
import org.eclipse.jetty.server.Request;

import java.net.InetSocketAddress;
import java.util.Set;

public class WhitelistedForwardedRequestCustomizer extends ForwardedRequestCustomizer
{
  private Set<String> forwardedForProxyWhitelist;             // this whitelist contains a set of all the proxy IPs using the X-Forwarded-For header

  /**
   * Making a constructor which can take in an array of whitelisted IP addresses
   * @param forwardedForProxyWhitelist
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
    HttpFields httpFields = request.getHttpFields();

    // we can configure SSL later on if we want to use the forwarded Cipher Suite and forwarded SSL Session Id header
//    // Do SSL first
//    if (getForwardedCipherSuiteHeader()!=null)
//    {
//      String cipher_suite=httpFields.getField(getForwardedCipherSuiteHeader()).toString();
//      if (cipher_suite!=null)
//        request.setAttribute("javax.servlet.request.cipher_suite",cipher_suite);
//    }
//    if (getForwardedSslSessionIdHeader()!=null)
//    {
//      String ssl_session_id=httpFields.getField(getForwardedSslSessionIdHeader()).toString();
//      if(ssl_session_id!=null)
//      {
//        request.setAttribute("javax.servlet.request.ssl_session_id", ssl_session_id);
//        request.setScheme(HttpScheme.HTTPS.asString());
//      }
//    }

    // Retrieving headers from the request
    String forwardedFor = getLeftMostFieldValue(httpFields,getForwardedForHeader());

    System.out.println("Inside WhitelistedForwardedRequestCustomizer");

    // we only care about X-Forwarded For, later on we can deal with hostHeader, forwardedHost, forwardedProto once we need them and have whitelists for them
    if ( forwardedFor != null )
    {
      // grab the proxy IP
      String proxyAddress = request.getRemoteAddr();

      System.out.println("Checking the whitelist");
      System.out.println(proxyAddress);

      if ( this.forwardedForProxyWhitelist.contains(proxyAddress) )
        request.setRemoteAddr(InetSocketAddress.createUnresolved(forwardedFor, request.getRemotePort()));

      // TODO: implement a logger for the unauthorized IPs
    }

    // we do not care about the other forwarded headers at the moment, can deal with these once we do enable them and have a whitelist
//    String forwardedHost = getLeftMostFieldValue(httpFields,getForwardedHostHeader());
//    String forwardedServer = getLeftMostFieldValue(httpFields,getForwardedServerHeader());
//    String forwardedProto = getLeftMostFieldValue(httpFields,getForwardedProtoHeader());


//    if (_hostHeader != null)
//    {
//      // Update host header
//      httpFields.put(HttpHeader.HOST.toString(),_hostHeader);
//      request.setServerName(null);
//      request.setServerPort(-1);
//      request.getServerName();
//    }
//    else if (forwardedHost != null)
//    {
//      // Update host header
//      httpFields.put(HttpHeader.HOST.toString(),forwardedHost);
//      request.setServerName(null);
//      request.setServerPort(-1);
//      request.getServerName();
//    }
//    else if (forwardedServer != null)
//    {
//      // Use provided server name
//      request.setServerName(forwardedServer);
//    }
//
//    if (forwardedProto != null)
//    {
//      request.setScheme(forwardedProto);
//      if (forwardedProto.equals(config.getSecureScheme()))
//        request.setSecure(true);
//    }
  }

  /* ------------------------------------------------------------ */

  /**
   *
   * @param fields
   * @param header
   * @return
   */
  protected String getLeftMostFieldValue(HttpFields fields, String header)
  {
    if (header == null)
      return null;

    String headerValue = fields.getField(header).toString();

    if (headerValue == null)
      return null;

    int commaIndex = headerValue.indexOf(',');

    if (commaIndex == -1)
    {
      // Single value
      return headerValue;
    }

    // The left-most value is the farthest downstream client
    return headerValue.substring(0,commaIndex);
  }

}
