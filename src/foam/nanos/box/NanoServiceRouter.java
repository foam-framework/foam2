/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.box;

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
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.ServletException;

public class NanoServiceRouter
  extends HttpServlet
  implements NanoService, ContextAware
{
  protected X x_;

  protected Map<String, foam.box.Box> serviceMap_ = new ConcurrentHashMap<>();

  public void service(String serviceKey, foam.box.Message message) {
    PM            pm       = new PM(this.getClass(), serviceKey);
    Logger        logger   = (Logger)getX().get("logger");

    try {
      Object      service  = getX().get(serviceKey);
      DAO         nSpecDAO = (DAO) getX().get("nSpecDAO");
      NSpec       spec     = (NSpec) nSpecDAO.find(serviceKey);
      foam.box.Box box     = getServiceBox(spec, service);

      if ( box == null ) {
        logger.warning("No service found for", serviceKey);
        return;
      }

      box.send(message);
    } catch (Throwable t) {
      logger.error(this.getClass(), "Error servicing request", t);
      t.printStackTrace();
    } finally {
      pm.log(getX());
    }
  }

  protected foam.box.Box getServiceBox(NSpec spec, Object service) {
    if ( spec == null ) return null;

    if ( ! serviceMap_.containsKey(spec.getName()) ) {
      serviceMap_.put(spec.getName(), createServiceBox(spec, service));
    }

    return serviceMap_.get(spec.getName());
  }

  protected foam.box.Box createServiceBox(NSpec spec, Object service) {
    Logger      logger   = (Logger)getX().get("logger");

    if ( ! spec.getServe() ) {
      logger.warning(this.getClass(), "Request attempted for disabled service", spec.getName());
      return null;
    }

    informService(service, spec);

    try {
      foam.box.Box result = null;
      Class cls = spec.getBoxClass() != null && spec.getBoxClass().length() > 0 ?
        Class.forName(spec.getBoxClass()) :
        DAOSkeleton.class ;
      Skeleton skeleton = (Skeleton)getX().create(cls);
      result = skeleton;

      informService(skeleton, spec);
      skeleton.setDelegateObject(service);

      foam.core.X x = getX().put(NSpec.class, spec);

      result = new foam.box.SessionServerBox(x, result, spec.getAuthenticate());

      return result;
    } catch (ClassNotFoundException ex) {
      logger.error(this.getClass(), "Unable to create NSpec servlet: ", spec.getName(), "error: ", ex);
    }
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
