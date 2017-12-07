/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.csv;

import foam.lib.parse.*;


public class CSVEscapeStringParser implements Parser {
  public final static char ESCAPE = '"';

  public CSVEscapeStringParser() {
  }

  public PStream parse(PStream ps, ParserContext x) {
    if ( ps == null ) return null;
    char head = ps.head();
    if ( head != ESCAPE ) return null;

    int delimCount = 0;
    StringBuilder sb = builders.get();
    ps = ps.tail();

    while ( ps.valid() ) {
      head = ps.head();
      if ( head == ESCAPE ) {
        if ( delimCount == 1) {
          sb.append(ESCAPE);
          delimCount = 0;
        } else if ( delimCount == 0 ) {
          delimCount = 1;
        }
      } else if (head == ',') {
        if ( delimCount == 1 ) {
          break;
        } else {
          delimCount = 0;
          sb.append(head);
        }
      } else {
        if ( delimCount == 1 ) {
          return null;
        } else {
          delimCount = 0;
          sb.append(head);
        }
      }
      ps = ps.tail();
    }

    //check the last column
    if ( ! ps.valid() && delimCount != 1 ) {
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
      StringBuilder sb = super.get();
      sb.setLength(0);
      return sb;
    }
  };
}