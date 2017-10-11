package foam.nanos.ws;

import java.io.IOException;
import java.net.InetSocketAddress;

import foam.nanos.*;
import foam.core.*;

public class NanoWebSocketServer
    extends ContextAwareSupport
    implements NanoService
{
    protected int port_ = 8081;
    protected WebSocketServer server_;
    public void start() {
        System.out.println("Starting WebSocket Server on port " + port_);

        server_ = new WebSocketServer(new InetSocketAddress(port_));
        server_.setX(getX());
        server_.start();
    }
}
