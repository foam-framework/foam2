/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.network;

import foam.box.Box;
import foam.box.Message;
import foam.box.SessionServerBox;
import foam.box.Skeleton;
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
import foam.nanos.http.AuthWebAgent;
import foam.nanos.http.NanoRouter;
import foam.nanos.http.WebAgent;
import foam.nanos.logger.PrefixLogger;
import foam.nanos.logger.Logger;
import foam.nanos.pm.PM;
import foam.nanos.pm.PMWebAgent;
import foam.nanos.NanoService;
import foam.nanos.network.SocketWebAgent;

import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.InputStream;
import java.io.IOException;
import java.io.OutputStream;
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

    foam.core.ClassInfoImpl clsInfo = new foam.core.ClassInfoImpl();
    clsInfo.setObjClass(this.getClass());
    clsInfo.setId(this.getClass().getSimpleName());
    PM pm = PM.create(getX(), clsInfo, serviceKey);

    X requestContext = getX()
      .put("logger", new PrefixLogger(new Object[] {
            "[Service]",
            spec.getName()
          }, (Logger) getX().get("logger")))
      .put(NSpec.class, spec);
    //      .put("requestMessage", requestMsg);
    // NOTE: Passing the requestMessage as a context paremeter through
    // to the SessionServerBox is a potential memory leak.  On replay,
    // for example, the entire medusaEntry data set is a requestMessage
    SocketWebAgent agent = (SocketWebAgent) getWebAgent(spec, service);
    if ( agent == null ) {
      throw new IOException("Service not found: "+serviceKey);
    }
    try {
      new SessionServerBox(requestContext, agent.getSkeletonBox(), agent.getAuthenticate()).send(msg);
      // agent.execute(requestContext);
    } catch (Exception e) {
      logger_.error("Error serving", serviceKey, e);
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

