/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import com.sun.net.httpserver.*;
import foam.box.*;
import foam.core.*;
import foam.dao.*;
import foam.nanos.boot.NSpec;
import foam.nanos.logger.NanoLogger;
import foam.nanos.pm.PM;
import java.io.IOException;
import java.net.URI;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;
import javax.servlet.http.HttpServlet;

public class NanoHttpHandler
  extends    ContextAwareSupport
  implements HttpHandler
{

  protected Map<String, HttpHandler> handlerMap_ = new ConcurrentHashMap();

  public NanoHttpHandler(X x) {
    setX(x);
  }

  @Override
  public void handle(HttpExchange exchange) throws IOException {
    URI         requestURI = exchange.getRequestURI();
    String      path       = requestURI.getPath();
    String      query      = requestURI.getQuery();
  //AuthService auth       = this.X.get("authService");
    String[]    urlParams  = path.split("/");
    String      serviceKey = urlParams[1];
    Object      service    = getX().get(serviceKey);
    DAO         nSpecDAO   = (DAO) getX().get("nSpecDAO");
    NSpec       spec       = (NSpec) nSpecDAO.find(serviceKey);
    NanoLogger  logger     = (NanoLogger) getX().get("logger");

    logger.info(this.getClass(), "HTTP Request", path, serviceKey);
    // System.out.println("HTTP Request: " + path + ", " + serviceKey);

    HttpHandler handler = getHandler(spec, service);

    // if ( auth.checkPermission(...) ) {}

    if ( handler != null ) {
      PM pm = new PM(this.getClass(), serviceKey);

      try {
        handler.handle(exchange);
      } finally {
        pm.log(getX());
      }
    }
  }

  public HttpHandler getHandler(NSpec spec, Object service) {
    if ( spec == null ) return null;

    if ( ! handlerMap_.containsKey(spec.getName()) ) {
      handlerMap_.put(spec.getName(), createHandler(spec, service));
    }

    return handlerMap_.get(spec.getName());
  }

  public HttpHandler createHandler(NSpec spec, Object service) {
    if ( spec.getServe() ) {
      try {
        Class cls = spec.getBoxClass() != null && spec.getBoxClass().length() > 0 ?
          Class.forName(spec.getBoxClass()) :
          DAOSkeleton.class ;
        Skeleton skeleton = (Skeleton) cls.newInstance();

        if ( skeleton instanceof ContextAware ) ((ContextAware) skeleton).setX(getX());

        skeleton.setDelegateObject(service);

        service = new ServiceServlet(service, skeleton);
      } catch (IllegalAccessException e) {
      } catch (ClassNotFoundException e) {
      } catch (InstantiationException e) {
      }
    }

    if ( service instanceof ContextAware ) ((ContextAware ) service).setX(getX());

    if ( service instanceof WebAgent ) service = new WebAgentServlet((WebAgent) service);

    if ( service instanceof ContextAware ) ((ContextAware ) service).setX(getX());

    if ( service instanceof HttpServlet  ) service = new ServletHandler((HttpServlet) service);

    if ( service instanceof ContextAware ) ((ContextAware ) service).setX(getX());

    if ( service instanceof HttpHandler ) return (HttpHandler) service;

    NanoLogger logger = (NanoLogger) getX().get("logger");
    logger.error(this.getClass(), spec.getName() + " does not have an HttpHandler.");

    return null;
  }
}
