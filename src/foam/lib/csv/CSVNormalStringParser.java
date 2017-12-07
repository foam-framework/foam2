/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.csv;

import foam.lib.parse.*;

public class CSVNormalStringParser implements Parser {

  public CSVNormalStringParser() {

  }

  public PStream parse(PStream ps, ParserContext x) {
    if ( ps == null ) {
      return null;
    }

    char head;
    StringBuilder sb = builders.get();

    while ( ps.valid() ) {
      head = ps.head();
      if ( head == '\"') {
        return null;
      }
      if ( head == ',' ) {
        break;
      }
      sb.append(head);
      ps = ps.tail();
    }

    if ( ! ps.valid() && sb.toString().equals("") ) {
      return null;
    }

    return ps.setValue(sb.toString());
  }

  protected ThreadLocal<StringBuilder> builders = new ThreadLocal<StringBuilder>() {
    @Override
    protected StringBuilder initialValue() {
      return new StringBuilder();
    }
    @Override
    public StringBuilder get() {
      StringBuilder sb =  super.get();
      sb.setLength(0);
      return sb;
    }
  };
}