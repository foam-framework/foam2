/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.boot;

import foam.core.*;
import foam.dao.ProxyDAO;
import foam.nanos.*;
import foam.nanos.logger.Logger;
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

  public synchronized Object create(X x) {
    if ( ns_ != null ) return ns_;

    Logger logger = null;
    if ( ! "logger".equals(spec_.getName()) ) {
      logger = (Logger) x.get("logger");
    }

    // Avoid infinite recursions when creating services
    if ( creatingThread_ == Thread.currentThread() ) {
      if ( logger != null ) {
        logger.warning("Recursive Service Factory", spec_.getName());
      } else {
        System.err.println("Recursive Service Factory: " + spec_.getName());
      }

      return ns_;
    }
    creatingThread_ = Thread.currentThread();

    PM     pm     = new PM(this.getClass(), spec_.getName());

    try {
      if ( logger != null ) {
        logger.info("Creating Service", spec_.getName());
      } else {
        System.out.println("Creating Service: " + spec_.getName());
      }
      ns_ = spec_.createService(x_.getX().put(NSpec.class, spec_));
      Object ns = ns_;
      while ( ns != null ) {
        if ( ns instanceof ContextAware ) {
          // REVIEW: System is presently dependent on this blind setX call. - Joel
          // if ( ((ContextAware) ns).getX() == null ) {
          ((ContextAware) ns).setX(x_.getX());
          // }
        }
        if ( ns instanceof NSpecAware ) {
          if ( ((NSpecAware) ns).getNSpec() == null ) {
            ((NSpecAware) ns).setNSpec(spec_);
          }
        }
        if ( ns instanceof NanoService )  {
          if ( logger != null ) {
            logger.info("Starting Service", spec_.getName());
          } else {
            System.out.println("Starting Service: " + spec_.getName());
          }
          ((NanoService) ns).start();
        }
        if ( ns instanceof ProxyDAO ) {
          ns = ((ProxyDAO) ns).getDelegate();
        } else {
          ns = null;
        }
      }
      if ( logger != null ) {
        logger.info("Created Service", spec_.getName(), ns_ != null ? ns_.getClass().getSimpleName() : "null");
      } else {
        System.out.println("Created Service: " + spec_.getName());
      }
    } catch (Throwable t) {
      if ( logger != null ) {
        logger.error("Error Creating Service", spec_.getName(), t);
      } else {
        System.err.println("Error Creating Service: " + spec_.getName());
        t.printStackTrace();
      }
    } finally {
      pm.log(x_.getX());
      creatingThread_ = null;
    }

    return ns_;
  }

  public synchronized void invalidate(NSpec spec) {
    if ( ! SafetyUtil.equals(spec.getService(), spec_.getService())
      || ! SafetyUtil.equals(spec.getServiceClass(), spec_.getServiceClass())
      || ! SafetyUtil.equals(spec.getServiceScript(), spec_.getServiceScript())
    ) {
      ns_ = null;
    }

    spec_ = spec;
    if ( ! spec_.getLazy() ) {
      create(x_);
    }
  }
}
