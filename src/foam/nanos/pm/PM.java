/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.pm;

import foam.core.X;

public class PM {
  protected Class  cls_;
  protected String name_;
  protected long   startTime_;
  protected long   endTime_;

  public PM(Class cls, String name) {
    cls_       = cls;
    name_      = name;
    startTime_ = System.currentTimeMillis();
  }

  public void log(X x) {
    endTime_ = System.currentTimeMillis();
    if ( x == null ) return;
    PMLogger logger = (PMLogger) x.get(DAOPMLogger.SERVICE_NAME);
    if ( logger != null ) logger.log(this);
  }

  public Class getClassType() {
    return cls_;
  }

  public String getName() {
    return name_;
  }

  public long getStartTime() {
    return startTime_;
  }

  public long getTime() {
    return endTime_ - startTime_;
  }
}
