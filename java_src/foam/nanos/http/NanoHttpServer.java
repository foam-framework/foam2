package foam.nanos.http;

import java.io.IOException;
import java.net.InetSocketAddress;

import com.sun.net.httpserver.*;

import foam.core.*;

public class NanoHttpServer extends ContextAwareSupport implements NanoService {

  protected HttpServer server_;
  protected int port_ = 80;

  public void start() {
    try {
      server_ = HttpServer.create(new InetSocketAddress(port_), 0);
    } catch(IOException e) {
       e.printStackTrace();
    }

    server_.createContext("/", new NanoHttpHandler(getX()));

    server_.start();
  }
}
