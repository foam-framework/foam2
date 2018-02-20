/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.logger;

import java.io.*;
import java.text.SimpleDateFormat;

public abstract class AbstractLogger
  implements Logger
{

  protected static final ThreadLocal<SimpleDateFormat> sdf = new ThreadLocal<SimpleDateFormat>() {
    @Override
    protected SimpleDateFormat initialValue() {
      return new SimpleDateFormat("yyyy.MM.dd.HH.mm.ss");
    }
  };

  protected ThreadLocal<StringBuilder> sb = new ThreadLocal<StringBuilder>() {
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


  public String formatArg(Object obj) {
    if ( obj instanceof Throwable ) {
      Throwable   t  = (Throwable) obj;
      Writer      w  = new StringWriter();
      PrintWriter pw = new PrintWriter(w);

      t.printStackTrace(pw);

      return w.toString();
    }

    return String.valueOf(obj);
  }

  // TODO: use thread-local StringBuilder
  public String combine(Object[] args) {
    StringBuilder str = sb.get();
    for ( Object n : args ) {
      str.append(',');
      str.append(formatArg(n));
    }
    return str.toString();
  }

}
