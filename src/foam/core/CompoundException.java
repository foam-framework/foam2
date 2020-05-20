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

  public void maybeThrow(AppConfig appConfig) {
    if ( Mode.TEST == appConfig.getMode() ) {
      for ( int i = 0 ; i < exceptions_.size() ; i++ ) {
        System.out.println( "This is an error =======> " + ( (Throwable) exceptions_.get(i) ) );
        throw (RuntimeException) exceptions_.get(i);
      }
    }
  }
}
