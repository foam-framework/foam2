package foam.nanos.http;

import java.io.IOException;
import java.net.URI;

import com.sun.net.httpserver.*;

public class NanoHttpHandler implements HttpHandler {

  protected X;

  public NanoHttpHandler(X x) {
    this.X = x;
  }

  @Override
  public void handle(HttpExchange exchange) throws IOException {
    URI requestURI = exchange.getRequestURI();
    String path = requestURI.getPath();
    String query = requestURI.getQuery();

    // AuthService auth = this.X.get(AuthService);

    String[] urlParams = path.split("/");

    /*
     * Get the item right after the first slash
     * E.g.: /foo/bar => ['', 'foo', 'bar']
    */
    String serviceKey = urlParams[1];

    // DAO services = (DAO) this.X.get('serviceFactoryDAO');
    // NSSpec serviceFactory = services.find(serviceKey);

    NanoService service = this.X.get(serviceKey);

    if ( service instanceof HttpHandler ) {
      // if ( auth.checkPermission(...) ) {}

      ((HttpHandler) service).handle(exchange);
    } else {
      String errorMsg = "Service " + serviceKey + " does not have a HttpHandler";

      throw new RuntimeException(errorMsg);
    }
  }
}