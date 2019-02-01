/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.boot;

import foam.core.*;
import foam.nanos.*;
import foam.nanos.logger.Logger;
import foam.nanos.pm.PM;

public class NSpecFactory
  implements XFactory
{
  NSpec  spec_;
  ProxyX x_;
  Thread creatingThread_ = null;
  Object ns_ = null;

  public NSpecFactory(ProxyX x, NSpec spec) {
    x_    = x;
    spec_ = spec;
  }

  public Object create(X x) {
    // Avoid infinite recursions when creating services
    if ( creatingThread_ == Thread.currentThread() ) {
      if ( ! "logger".equals(spec_.getName()) ) {
        Logger logger = (Logger) x.get("logger");
        if ( logger != null ) logger.warning("Recursive Service Factory", spec_.getName());
      }

      return null;
    }

    creatingThread_ = Thread.currentThread();

    synchronized ( this ) {
      if ( ns_ != null ) return ns_;

      PM pm = new PM(this.getClass(), spec_ == null ? "-" : spec_.getName());
      Logger logger = (Logger) x.get("logger");

      try {
        if (logger != null) logger.info("Creating Service", spec_.getName());
        ns_ = spec_.createService(x_.getX().put(NSpec.class, spec_));
        if (logger != null) logger.info("Created Service", spec_.getName());

        if (ns_ instanceof ContextAware) ((ContextAware) ns_).setX(x_.getX());
        if (ns_ instanceof NanoService) ((NanoService) ns_).start();
      } catch (Throwable t) {
        if (logger != null) logger.error("Error Creating Service", spec_.getName(), t);
      } finally {
        pm.log(x_.getX());
        creatingThread_ = null;
      }
    }

    return ns_;
  }
}
