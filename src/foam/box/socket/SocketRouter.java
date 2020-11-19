/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.box.socket;

import foam.box.Box;
import foam.box.Message;
import foam.box.SessionServerBox;
import foam.box.Skeleton;
import foam.box.socket.SocketWebAgent;
import foam.core.ContextAware;
import foam.core.FObject;
import foam.core.Detachable;
import foam.core.X;
import foam.core.ContextAware;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.dao.SessionDAOSkeleton;
import foam.lib.json.JSONParser;
import foam.nanos.boot.NSpec;
import foam.nanos.boot.NSpecAware;
import foam.nanos.http.NanoRouter;
import foam.nanos.http.WebAgent;
import foam.nanos.logger.PrefixLogger;
import foam.nanos.logger.Logger;
import foam.nanos.pm.PM;
import foam.nanos.pm.PMWebAgent;
import foam.nanos.NanoService;

import java.io.IOException;
import java.net.Socket;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class SocketRouter
  extends NanoRouter
  implements ContextAware
{
  protected Logger logger_;
  
  public SocketRouter(X x) {
    setX(x);
    nSpecDAO_ = (DAO) getX().get("nSpecDAO");
    nSpecDAO_.listen( new AbstractSink() {
      @Override
      public void put(Object obj, Detachable sub) {
        NSpec sp = (NSpec) obj;
        handlerMap_.remove(sp.getName());
      }
    }, null);
    
    logger_ = new PrefixLogger(new Object[] {
        this.getClass().getSimpleName(),
        "service",
      }, (Logger) getX().get("logger"));
  }

  @Override
  public X getX() {
    return x_;
  }

  @Override
  public void setX(X x) {
    x_ = x;
  }

  public void service(Message msg) 
    throws IOException {

    String serviceKey = (String) msg.getAttributes().get("serviceKey");
    Object service = getX().get(serviceKey);
    NSpec spec = (NSpec) nSpecDAO_.find(serviceKey);
    if ( spec == null ) {
      logger_.error(this.getClass().getSimpleName(), "Service not found", serviceKey);
      throw new IOException("Service not found: "+serviceKey);
    }

    PM pm = PM.create(getX(), this.getClass().getSimpleName(), serviceKey);

    X requestContext = getX()
      .put("logger", new PrefixLogger(new Object[] {
            this.getClass().getSimpleName(),
            spec.getName()
          }, (Logger) getX().get("logger")))
      .put(NSpec.class, spec);
    SocketWebAgent agent = (SocketWebAgent) getWebAgent(spec, service);
    if ( agent == null ) {
      logger_.error(this.getClass().getSimpleName(), "Agent not found", serviceKey);
      throw new IOException("Service not found: "+serviceKey);
    }
    try {
      new SessionServerBox(requestContext, agent.getSkeletonBox(), agent.getAuthenticate()).send(msg);
    } catch (Exception e) {
      logger_.error("Error serving", serviceKey, e);
      if ( ! serviceKey.equals("static") ) pm.error(getX(), e);
      throw e;
    } finally {
      if ( ! serviceKey.equals("static") ) pm.log(getX());
    }
  }

  protected WebAgent getAgent(Skeleton skeleton, NSpec spec) {
    WebAgent agent = new SocketWebAgent(skeleton, spec.getAuthenticate());
    informService(agent, spec);
    return agent;
  }
}

