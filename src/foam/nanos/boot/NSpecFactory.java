/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.boot;

import foam.core.*;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.*;
import foam.nanos.logger.Logger;
import foam.nanos.logger.StdoutLogger;
import foam.nanos.pm.PM;
import foam.util.SafetyUtil;

public class NSpecFactory
  implements XFactory
{
  NSpec  spec_;
  ProxyX x_;
  Thread creatingThread_ = null;
  Object ns_             = null;

  public NSpecFactory(ProxyX x, NSpec spec) {
    x_    = x;
    spec_ = spec;
  }

  void buildService(X x) {
    Logger logger = null;
    if ( ! "logger".equals(spec_.getName()) && ! "PM".equals(spec_.getName()) ) {
      logger = (Logger) x.get("logger");
    }
    if ( logger == null ) {
      logger = new StdoutLogger();
    }

    // Avoid infinite recursions when creating services
    if ( creatingThread_ == Thread.currentThread() ) {
      logger.warning("Recursive Service Factory", spec_.getName());
      return;
    }
    creatingThread_ = Thread.currentThread();

    PM     pm     = new PM(this.getClass(), spec_.getName());

    try {
      logger.info("Creating Service", spec_.getName());
      var service = spec_.createService(x_.getX().put(NSpec.class, spec_).put("logger", logger), null);
      if ( service instanceof DAO ) {
        if ( ns_ == null ) {
          ns_ = new ProxyDAO();
        }
        ((ProxyDAO) ns_).setDelegate((DAO) service);
      } else {
        ns_ = service;
      }

      Object ns = ns_;
      while ( ns != null ) {
        if ( ns instanceof ContextAware && ! ( ns instanceof ProxyX ) ) {
          ((ContextAware) ns).setX(x_.getX());
        }
        if ( ns instanceof NSpecAware ) {
          if ( ((NSpecAware) ns).getNSpec() == null ) {
            ((NSpecAware) ns).setNSpec(spec_);
          }
        }
        if ( ns instanceof NanoService )  {
          logger.info("Starting Service", spec_.getName());
          ((NanoService) ns).start();
        }
        if ( ns instanceof ProxyDAO ) {
          ns = ((ProxyDAO) ns).getDelegate();
        } else {
          ns = null;
        }
      }
      logger.info("Created Service", spec_.getName(), ns_ != null ? ns_.getClass().getSimpleName() : "null");
    } catch (Throwable t) {
      logger.error("Error Creating Service", spec_.getName(), t);
    } finally {
      pm.log(x_.getX());
      creatingThread_ = null;
    }
  }

  public synchronized Object create(X x) {
    if ( ns_ == null ||
         ns_ instanceof ProxyDAO && ((ProxyDAO) ns_).getDelegate() == null ) {
      buildService(x);
    }

    if ( ns_ instanceof XFactory ) return ((XFactory) ns_).create(x);

    return ns_;

  }

  public synchronized void invalidate(NSpec spec) {
    Logger logger = (Logger) x_.get("logger");
    if ( logger == null ) {
      logger = new StdoutLogger();
    }
    logger.info("Invalidating Service", spec_.getName());
    if ( ! SafetyUtil.equals(spec.getService(), spec_.getService())
      || ! SafetyUtil.equals(spec.getServiceClass(), spec_.getServiceClass())
      || ! SafetyUtil.equals(spec.getServiceScript(), spec_.getServiceScript())
    ) {
      logger.info("Invalidated Service", spec_.getName());
      if ( ns_ instanceof DAO ) {
        logger.warning("Invalidation of DAO Service not supported.", spec_.getName());
        // ((ProxyDAO) ns_).setDelegate(null);
      } else {
        ns_ = null;
      }
    }

    spec_ = spec;
    if ( ! spec_.getLazy() ) {
      create(x_);
    }
  }
}
