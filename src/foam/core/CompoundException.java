/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.core;

import java.util.ArrayList;

public class CompoundException
  extends RuntimeException
{
  private ArrayList exceptions_ = new ArrayList<Throwable>();

  public void add(Throwable t) {
    exceptions_.add(t);
  }

  public void maybeThrow() throws Throwable {
    for ( int i = 0 ; i < exceptions_.size() ; i++ ) {
      System.out.println( "This is an error =======> " + ( (Throwable) exceptions_.get(i) ) );
      throw (Throwable) exceptions_.get(i);
    }
  }
}
