/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.tcp;

import foam.nanos.http.NanoRouter;
import foam.nanos.NanoService;
import foam.nanos.http.WebAgent;
import foam.nanos.http.AuthWebAgent;
import foam.core.X;
import foam.core.FObject;
import foam.core.Detachable;
import foam.core.ContextAware;
import foam.dao.DAO;
import foam.dao.SessionDAOSkeleton;
import foam.dao.AbstractSink;
import foam.box.Message;
import foam.nanos.boot.NSpec;
import foam.nanos.boot.NSpecAware;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.box.Skeleton;
import foam.box.network.SocketWebAgent;
import foam.nanos.pm.PM;
import foam.nanos.pm.PMWebAgent;
import foam.lib.json.JSONParser;

import java.io.InputStream;
import java.io.OutputStream;
import java.io.IOException;
import java.net.Socket;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import foam.box.network.SocketReplyBox;

public class SocketRouter
  extends NanoRouter
{

  public SocketRouter(X x) {
    x_ = x;
    nSpecDAO_ = (DAO) x_.get("nSpecDAO");
    nSpecDAO_.listen( new AbstractSink() {
      @Override
      public void put(Object obj, Detachable sub) {
        NSpec sp = (NSpec) obj;
        handlerMap_.remove(sp.getName());
      }

    }, null);
  }

  public void service(String requestMessage, Socket socket) throws IOException {

    OutputStream out  = socket.getOutputStream();
    InputStream in = socket.getInputStream();

    X requestContext  = getX()
      .put(InputStream.class, in)
      .put(OutputStream.class, out)
      .put("requestMessage", requestMessage)
      .put("tcpSocket", socket);

    FObject result;
    try {
      result = requestContext.create(JSONParser.class).parseString(requestMessage);

    } catch ( Exception e ) {
      Logger logger = (Logger) getX().get("logger");
      if ( logger != null ) logger.error(e);
      throw e;
    }

    //TODO: how to response if result == null
    //TODO: how to response if result != type of foam.box.Message

    Message requestMsg = (Message) result;
    String serviceKey = (String) requestMsg.getAttributes().get("serviceKey");
    Object service = getX().get(serviceKey);
    NSpec spec = (NSpec) nSpecDAO_.find(serviceKey);
    WebAgent serv = getWebAgent(spec, service);
    PM pm = new PM(this.getClass(), serviceKey);

    // Get SyncBox Id.
    Long syncBoxId = (Long) requestMsg.getAttributes().get("syncBoxId");
    ((SocketReplyBox) requestMsg.getAttributes().get("replyBox")).setSyncBoxId(syncBoxId);
    try {
      if ( serv == null ) {
        Logger logger = (Logger) getX().get("logger");
        logger.error("No service found for: " + serviceKey);
        // TODO: send response
      } else {
        requestContext = requestContext
          .put("logger", new PrefixLogger(new Object[] { "[Service]", spec.getName() }, (Logger) getX().get("logger")))
          .put(NSpec.class, spec)
          .put("requestMessage", requestMsg);

        serv.execute(requestContext);
      }
    } catch (Exception e) {
      Logger logger = (Logger) getX().get("logger");
      if ( logger != null ) logger.error("Error serving" + serviceKey, e);
      throw e;
    } finally {
      if ( ! serviceKey.equals("static") ) pm.log(x_);
    }

  }

  @Override
  protected WebAgent createWebAgent(NSpec spec, Object service) {
    informService(service, spec);

    if ( spec.getServe() ) {
      try {
        Class cls = spec.getBoxClass() != null && spec.getBoxClass().length() > 0 ?
            Class.forName(spec.getBoxClass()) :
            SessionDAOSkeleton.class ;
        Skeleton skeleton = (Skeleton) cls.newInstance();

        // TODO: create using Context, which should do this automatically
        if ( skeleton instanceof ContextAware ) ((ContextAware) skeleton).setX(getX());

        informService(skeleton, spec);

        skeleton.setDelegateObject(service);

        service = new SocketWebAgent(skeleton, spec.getAuthenticate());
        informService(service, spec);
      } catch (IllegalAccessException | InstantiationException | ClassNotFoundException ex) {
        Logger logger = (Logger) getX().get("logger");
        if ( logger != null ) logger.error("Unable to create NSPec servlet: " + spec.getName(), ex);
      }
    } else {
      if ( service instanceof WebAgent ) {
        WebAgent pmService = (WebAgent) service;

        if ( spec.getPm() ) {
          service = new PMWebAgent(pmService.getClass(), spec.getName(), (WebAgent) service);
        }

        //
        // NOTE: Authentication must be last as HttpParametersWebAgent will consume the authentication parameters.
        //
        if ( spec.getAuthenticate() ) {
          service = new AuthWebAgent("service.run." + spec.getName(), (WebAgent) service);
        }
      }
    }
    if ( service instanceof WebAgent ) return (WebAgent) service;
    Logger logger = (Logger) getX().get("logger");
    logger.error(this.getClass(), spec.getName() + " does not have a WebAgent.");
    return null;
  }

}

