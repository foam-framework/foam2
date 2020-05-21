/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import java.util.ArrayList;
import foam.nanos.app.AppConfig;
import foam.nanos.app.Mode;

public class CompoundException
  extends RuntimeException
{
  private ArrayList exceptions_ = new ArrayList<Throwable>();

  public void add(Throwable t) {
    exceptions_.add(t);
  }

  public String toString() {
    return "CompoundException [exceptions_=" + exceptions_ + "]";
  }

  public String getMessage() {
    return super.getMessage();
  }

  public void maybeThrow(AppConfig appConfig) {
    if ( Mode.TEST == appConfig.getMode() ) {
      if ( exceptions_.size() != 0 ) {
        throw this;
      }
    }
  }
}
