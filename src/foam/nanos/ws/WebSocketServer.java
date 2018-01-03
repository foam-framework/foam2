/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.ws;

import foam.core.*;
import foam.nanos.logger.Logger;
import java.net.InetSocketAddress;
import org.java_websocket.*;
import org.java_websocket.handshake.*;
import org.java_websocket.server.*;

public class WebSocketServer
  extends    org.java_websocket.server.WebSocketServer
  implements foam.core.ContextAware
{
  // ContextAware support.
  protected X x;

  public void setX(X x) {
    this.x = x;
  }

  public X getX() {
    return x;
  }

  protected foam.nanos.box.NanoServiceRouter router_ = null;

  protected foam.nanos.box.NanoServiceRouter getRouter() {
    if ( router_ == null ) {
      router_ = getX().create(foam.nanos.box.NanoServiceRouter.class);
    }

    return router_;
  }

  public WebSocketServer(InetSocketAddress address) {
    super(address);
  }

  public void onClose(WebSocket connection, int code, String reason, boolean remote) {
  }

  public void onError(WebSocket conn, java.lang.Exception ex) {
  }

  public void onMessage(WebSocket conn, String message) {
    Logger                  log        = (Logger)getX().get("logger");

    try {
      String                path       = conn.getResourceDescriptor();
      String[]              urlParts   = path.split("/");
      String                serviceKey = urlParts[2];
      Object                service    = getX().get(serviceKey);
      foam.dao.DAO          nSpecDAO   = (foam.dao.DAO) getX().get("nSpecDAO");
      foam.nanos.boot.NSpec spec       = (foam.nanos.boot.NSpec) nSpecDAO.find(serviceKey);

      if ( spec == null ) {
        log.warning("Request for non-existant service", serviceKey);
        return;
      }

      if ( ! spec.getServe() ) {
        log.warning("Request for service that is not serving.", serviceKey);
        return;
      }

      foam.box.RawWebSocketBox returnBox = getX().create(foam.box.RawWebSocketBox.class);
      final WebSocket capturedConnection = conn;
      returnBox.setSocket(new foam.net.WebSocket() {
            @Override
            public void send(String message) throws java.io.IOException {
              try {
                capturedConnection.send(message);
              } catch (org.java_websocket.exceptions.WebsocketNotConnectedException e) {
                e.printStackTrace();
                throw new java.io.IOException(e);
              }
            }
        });

      X requestContext = getX().put("returnBox", returnBox);

      FObject request = requestContext.create(foam.lib.json.JSONParser.class).parseString(message);

      if ( request == null ) {
        log.warning("Failed to parse request.", message);
        return;
      }

      if ( ! ( request instanceof foam.box.Message ) ) {
        log.warning("Request was not a box message.", message);
        return;
      }

      foam.box.Message obj = (foam.box.Message)request;
      obj.getLocalAttributes().put("x", requestContext);

      getRouter().service(serviceKey, obj);
    } catch(java.lang.Exception e) {
      log.error("Error handling websocket request", e, message);
    }
  }

  public void onOpen(WebSocket conn, ClientHandshake handshake) {
    Logger log = (Logger) getX().get("logger");
    log.info("WebSocket client connect.");
  }

  public void onStart() {
  }
}
