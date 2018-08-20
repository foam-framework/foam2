/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.ws;

import foam.box.Message;
import foam.box.RawWebSocketBox;
import foam.core.ContextAwareSupport;
import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.lib.json.JSONParser;
import foam.nanos.boot.NSpec;
import foam.nanos.box.NanoServiceRouter;
import foam.nanos.logger.Logger;
import org.eclipse.jetty.websocket.api.RemoteEndpoint;
import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.UpgradeRequest;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketClose;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketConnect;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketMessage;
import org.eclipse.jetty.websocket.api.annotations.WebSocket;

import java.io.IOException;

@WebSocket
public class NanoWebSocket
  extends ContextAwareSupport
{
  protected Session session_ = null;
  protected NanoServiceRouter router_ = null;
  protected Logger logger_= null;

  public NanoWebSocket(X x) {
    setX(x);
  }

  public NanoServiceRouter getRouter() {
    if ( router_ == null ) {
      router_ = getX().create(NanoServiceRouter.class);
    }
    return router_;
  }

  public Logger getLogger() {
    if ( logger_ == null ) {
      logger_ = (Logger) getX().get("logger");
    }
    return logger_;
  }

  @OnWebSocketConnect
  public void onWebSocketConnect(Session session) {
    session_ = session;
    getLogger().info("WebSocket session connected.");
  }

  @OnWebSocketClose
  public void onWebSocketClose(int code, String reason) {
    session_ = null;
    getLogger().info("WebSocket session closed.");
  }

  @OnWebSocketMessage
  public void onWebSocketMessage(String message) {
    try {
      if (session_ != null && session_.isOpen()) {
        RemoteEndpoint remote = session_.getRemote();
        UpgradeRequest upgrade = session_.getUpgradeRequest();
        String path = upgrade.getRequestURI().getPath();
        String serviceKey = path.split("/")[2];
        DAO nSpecDAO = (DAO) getX().get("nSpecDAO");
        NSpec spec = (NSpec) nSpecDAO.find(serviceKey);

        if ( spec == null ) {
          getLogger().warning("Request for non-existent service.", serviceKey);
          return;
        }

        if ( ! spec.getServe() ) {
          getLogger().warning("Request for service that is not being served.", serviceKey);
          return;
        }

        RawWebSocketBox returnBox = getX().create(RawWebSocketBox.class);
        returnBox.setSocket(new foam.net.WebSocket() {
          @Override
          public void send(String message) throws IOException {
            remote.sendString(message);
          }
        });

        // put return box into context
        X context = getX().put("returnBox", returnBox);

        // parse incoming message
        FObject request = context.create(JSONParser.class).parseString(message);
        if ( request == null ) {
          getLogger().warning("Failed to parse request.", message);
          return;
        }

        // check if instance of foam.box.Message
        if ( ! ( request instanceof Message ) ) {
          getLogger().warning("Request was not a box message.", message);
          return;
        }

        // put context into message
        Message obj = (Message) request;
        obj.getLocalAttributes().put("x", context);

        // pass message to service via NanoRouter
        getRouter().service(serviceKey, obj);
      } else {
        getLogger().warning("WebSocket session not connected.");
      }
    } catch ( Throwable t ) {
      getLogger().error("Error handling WebSocket request.", t, message);
    }
  }
}
