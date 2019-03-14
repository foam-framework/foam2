package foam.nanos.ws;

import java.io.IOException;
import java.net.InetSocketAddress;

import foam.nanos.*;
import foam.core.*;

public class NanoWebSocketServer
  extends ContextAwareSupport
  implements NanoService
{
  protected int port_ = 8080;
  protected WebSocketServer server_;
  public void start() {
    int port = port_;
    foam.nanos.jetty.HttpServer httpServer = (foam.nanos.jetty.HttpServer) getX().get("http");
    if ( httpServer != null ) {
      port = httpServer.getPort();
      ((foam.nanos.logger.Logger) getX().get("logger")).debug(this.getClass().getSimpleName(), "http port", httpServer.getPort());
    } else {
      ((foam.nanos.logger.Logger) getX().get("logger")).warning(this.getClass().getSimpleName(), "http not found in context");
    }
    port += 1;
    System.out.println("Starting WebSocket Server on port " + port);

    server_ = new WebSocketServer(new InetSocketAddress(port));
    server_.setX(getX());
    server_.start();
  }
}
