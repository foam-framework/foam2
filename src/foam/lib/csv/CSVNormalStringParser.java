/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.csv;

import foam.lib.parse.*;

/**
 * The class parse the CSV normal string base on the CSV string rule
 * The string can not contain '"', '\r', '\n' and ','
 * eg:
 *  abc123    : legal
 *  ab"e123   : illegal
 *  ab\ne123  : illegal
 *  ab\re123  : illegal
 */
public class CSVNormalStringParser implements Parser {

  private static Parser newlineParser = new CSVNewlineParser();
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
      if ( head == '\\') {
        PStream ps1 = ps;
        if ( ps.apply(newlineParser, x) == null ) {
          sb.append("\\\\");
          ps = ps.tail();
          continue;
        } else {
          return null;
        }
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