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
  private ArrayList exceptions_ = new ArrayList<RuntimeException>();
  private final ThreadLocal<StringBuilder> sb_ = new ThreadLocal<>() {
    @Override
    protected StringBuilder initialValue() {
      return new StringBuilder();
    }

    @Override
    public StringBuilder get() {
      StringBuilder b = super.get();
      b.setLength(0);
      return b;
    }
  };

  public void add(Throwable t) {
    exceptions_.add(t);
  }

  public void maybeThrow() {
    if ( exceptions_.size() != 0 ) {
      throw this;
    }
  }

  @Override
  public String getMessage() {
    var str = sb_.get();
    var size = exceptions_.size();

    for ( int i = 0; i < size; i++ ) {
      Throwable t = (Throwable) exceptions_.get(i);
      var counter = i + 1;

      str.append('[').append(counter).append('/').append(size).append("] ")
        .append(t);
      while ( t.getCause() != null ) {
        t = t.getCause();
        str.append(", Cause: ").append(t);
      }
      if ( counter < size ) str.append(';');
    }
    return str.toString();
  }
}
