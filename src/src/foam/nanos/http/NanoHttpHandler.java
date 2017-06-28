/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import com.sun.net.httpserver.*;
import foam.core.*;
import foam.dao.DAO;
import foam.nanos.*;
import java.io.IOException;
import java.net.URI;
import javax.servlet.http.HttpServlet;

public class NanoHttpHandler
  extends    ContextAwareSupport
  implements HttpHandler
{

  public NanoHttpHandler(X x) {
    x_ = x;
  }

  @Override
  public void handle(HttpExchange exchange) throws IOException {
    URI    requestURI = exchange.getRequestURI();
    String path       = requestURI.getPath();
    String query      = requestURI.getQuery();

    // AuthService auth = this.X.get(AuthService);

    String[] urlParams = path.split("/");

    /*
     * Get the item right after the first slash
     * E.g.: /foo/bar => ['', 'foo', 'bar']
    */
    String serviceKey = urlParams[1];
    Object service    = x_.get(serviceKey);

    System.out.println("HTTP Request: " + path + ", " + serviceKey);

    if ( service instanceof HttpHandler ) {
      // if ( auth.checkPermission(...) ) {}

      ((HttpHandler) service).handle(exchange);
    } if ( service instanceof HttpServlet ) {
      // if ( auth.checkPermission(...) ) {}

      this.handleServlet((HttpServlet) service, exchange);
    } if ( service instanceof WebAgent ) {
      // if ( auth.checkPermission(...) ) {}

      if ( service instanceof ContextAware ) ((ContextAware) service).setX(this.getX());

      this.handleServlet(new WebAgentServlet((WebAgent) service), exchange);
    } if ( service instanceof DAO ) {
      // todo auth check, server==true check

      this.handleServlet(new ServiceServlet(service), exchange);
    } else {
      String errorMsg = "Service " + serviceKey + " does not have a HttpHandler";

      throw new RuntimeException(errorMsg);
    }
  }

  public void handleServlet(HttpServlet s, HttpExchange exchange) throws IOException {
    if ( s instanceof ContextAware ) ((ContextAware) s).setX(this.getX());

    new ServletHandler(s).handle(exchange);
  }
}
