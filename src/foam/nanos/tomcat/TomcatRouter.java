package foam.nanos.tomcat;

import foam.nanos.http.NanoRouter;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.websocket.server.ServerEndpointConfig;
import javax.websocket.server.ServerEndpointConfig;
import javax.websocket.server.PathParam;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;

public class TomcatRouter
  extends NanoRouter
{
  {
    x_ = new foam.nanos.boot.Boot().getX();
  }

  @Override
  public void init(javax.servlet.ServletConfig config) throws javax.servlet.ServletException {
    super.init(config);

    try {
      ((javax.websocket.server.ServerContainer)
       config.getServletContext().getAttribute("javax.websocket.server.ServerContainer")).
        addEndpoint(ServerEndpointConfig.Builder.
                    create(WebSocketHandler.class, "/service/{service}").
                    configurator(new Configurator(getX())).
                    build());
    } catch (javax.websocket.DeploymentException e) {
      e.printStackTrace();
    }
  }

  protected class Configurator extends javax.websocket.server.ServerEndpointConfig.Configurator {
    public foam.core.X x;

    public Configurator(foam.core.X x) {
      this.x = x;
    }

    protected foam.nanos.box.NanoServiceRouter router_ = null;

    protected foam.nanos.box.NanoServiceRouter getRouter() {
      if ( router_ == null ) {
        router_ = getX().create(foam.nanos.box.NanoServiceRouter.class);
      }

      return router_;
    }

    @Override
    public <T> T getEndpointInstance(Class<T> type) throws InstantiationException {
      T instance = super.getEndpointInstance(type);
      ((WebSocketHandler)instance).setRouter(getRouter());
      if ( instance instanceof foam.core.ContextAware ) {
        ((foam.core.ContextAware)instance).setX(x);
      }
      return instance;
    }
  }

  protected static class WebSocketHandler
    extends foam.core.ContextAwareSupport {

    public WebSocketHandler() {}

    protected foam.nanos.box.NanoServiceRouter router_ = null;

    public void setRouter(foam.nanos.box.NanoServiceRouter router) {
      router_ = router;
    }

    protected foam.nanos.box.NanoServiceRouter getRouter() {
      return router_;
    }

    private foam.box.RawWebSocketBox returnBox_;
    private Integer id_;

    @OnOpen
    public void onOpen(javax.websocket.Session session) {
      System.out.println("On open " + session.hashCode());
      returnBox_ = getX().create(foam.box.RawWebSocketBox.class);

      final java.util.concurrent.BlockingQueue<String> queue = new java.util.concurrent.LinkedTransferQueue<String>();
      final javax.websocket.RemoteEndpoint.Basic capturedEndpoint = session.getBasicRemote();
      final Integer id = new java.util.Random().nextInt();
      id_ = id;

      System.out.println("new id" + Integer.toString(id, 16));

      Thread socketThread = new Thread(new Runnable() {
          public void run() {
            while ( true ) {
              try {
                String message = queue.take();
                System.out.println("(" + Integer.toString(id, 16) + ") send");
                capturedEndpoint.sendText(message);
              } catch ( InterruptedException e ) {
              } catch ( java.io.IOException e) {
                break;
              }
            }
          }
        });

      socketThread.start();


      returnBox_.setSocket(new foam.net.WebSocket() {
          @Override
          public void send(String message) throws java.io.IOException {
            System.out.println("(" + Integer.toString(id, 16) + ") append");
            try {
              queue.put(message);
            } catch (InterruptedException e) {
              throw new java.io.IOException(e);
            }
          }
        });
    }

    @OnMessage
    public void onMessage(@PathParam("service") String serviceKey, String message, javax.websocket.Session session) {
      foam.nanos.logger.Logger log       = (foam.nanos.logger.Logger)getX().get("logger");

      try {
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

        foam.core.X requestContext = getX().put("returnBox", returnBox_).put("webSocketId", new Integer(id_));

        foam.core.FObject request = requestContext.create(foam.lib.json.JSONParser.class).parseString(message);

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
  }
}
