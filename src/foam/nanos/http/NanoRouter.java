/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import foam.box.Skeleton;
import foam.core.ContextAware;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.DAOSkeleton;
import foam.nanos.boot.NSpec;
import foam.nanos.boot.NSpecAware;
import foam.nanos.logger.Logger;
import foam.nanos.NanoService;
import foam.nanos.pm.PM;
import java.io.PrintWriter;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.ServletException;

public class NanoRouter
  extends HttpServlet
  implements NanoService, ContextAware
{
  protected X x_;

  protected Map<String, WebAgent> handlerMap_ = new ConcurrentHashMap<>();

  @Override
  protected synchronized void service(HttpServletRequest req, HttpServletResponse resp)
    throws ServletException, IOException
  {
    String      path       = req.getRequestURI();
    String[]    urlParams  = path.split("/");
    String      serviceKey = urlParams[2];
    Object      service    = getX().get(serviceKey);
    DAO         nSpecDAO   = (DAO) getX().get("nSpecDAO");
    NSpec       spec       = (NSpec) nSpecDAO.find(serviceKey);
    WebAgent    serv       = getWebAgent(spec, service);
    PM          pm         = new PM(this.getClass(), serviceKey);

    resp.setContentType("text/html");

    try {
      if ( serv == null ) {
        System.err.println("No service found for: " + serviceKey);
      } else {
        X y = getX().put(HttpServletRequest.class, req).put(HttpServletResponse.class, resp).put(PrintWriter.class, resp.getWriter());
        serv.execute(y);
      }
    } catch (Throwable t) {
      System.err.println("Error serving " + serviceKey + " " + path);
      t.printStackTrace();
    } finally {
      if ( ! serviceKey.equals("static") ) pm.log(x_);
    }
  }

  protected WebAgent getWebAgent(NSpec spec, Object service) {
    if ( spec == null ) return null;

    if ( ! handlerMap_.containsKey(spec.getName()) ) {
      handlerMap_.put(spec.getName(), createWebAgent(spec, service));
    }

    return handlerMap_.get(spec.getName());
  }

  protected WebAgent createWebAgent(NSpec spec, Object service) {
    informService(service, spec);

    if ( spec.getServe() ) {
      try {
        Class cls = spec.getBoxClass() != null && spec.getBoxClass().length() > 0 ?
            Class.forName(spec.getBoxClass()) :
            DAOSkeleton.class ;
        Skeleton skeleton = (Skeleton) cls.newInstance();

        // TODO: create using Context, which should do this automatically
        if ( skeleton instanceof ContextAware ) ((ContextAware) skeleton).setX(getX());

        informService(skeleton, spec);

        skeleton.setDelegateObject(service);

        service = new ServiceWebAgent(service, skeleton, spec.getAuthenticate());
        informService(service, spec);
      } catch (IllegalAccessException | InstantiationException | ClassNotFoundException ex) {
        ex.printStackTrace();
        ((Logger) getX().get("logger")).error("Unable to create NSPec servlet: " + spec.getName());
      }
    }

/*
    if ( service instanceof WebAgent ) {
      service = new WebAgentServlet((WebAgent) service);
      informService(service, spec);
    }
    */

    if ( service instanceof WebAgent ) return (WebAgent) service;

    Logger logger = (Logger) getX().get("logger");
    logger.error(this.getClass(), spec.getName() + " does not have a WebAgent.");
    return null;
  }

  protected void informService(Object service, NSpec spec) {
    if ( service instanceof ContextAware ) ((ContextAware) service).setX(getX());
    if ( service instanceof NSpecAware   ) ((NSpecAware) service).setNSpec(spec);
  }

  @Override
  public void start() {

  }

  @Override
  public X getX() {
    return x_;
  }

  @Override
  public void setX(X x) {
    x_ = x;
  }
}
