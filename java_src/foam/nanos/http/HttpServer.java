package foam.nanos.http;

import java.io.IOException;
import java.io.RuntimeException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URI;

import com.sun.net.httpserver.*;

import foam.core.*;

public class HttpServer extends ContextAwareSupport implements NanoService {
  private HttpServer server;

  protected int port_ = 80;

  static void start() {
    server = HttpServer.create(new InetSocketAddress(port), 0);
    nanosList = nanos;

    server.createContext('/', new nanoHttpHandler());

    server.start();
  }

  static class nanoHttpHandler implements HttpHandler {
    @Override
    public void handle(HttpExchange exchange) throws IOException {
      URI requestURI = exchange.getRequestURI();
      String path = requestURI.getPath();
      String query = requestURI.getQuery();

      // AuthService auth = this.X.get(AuthService);

      String[] urlParams = path.split('/');

      /*
       * Get the item right after the first slash
       * E.g.: /foo/bar => ['', 'foo', 'bar']
      */
      String serviceKey = urlParams[1];

      DAO services = (DAO) this.X.get('serviceFactoryDAO');
      NSSpec serviceFactory = services.find(serviceKey);

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
}