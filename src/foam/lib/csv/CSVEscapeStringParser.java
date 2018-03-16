/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.csv;

import foam.lib.parse.*;

/**
 * The class parse the CSV special case string base on the CSV rule.
 * The whole string should be included inside the double quotation marks.
 * The string can contain '"', '\r', '\n', and ','.
 * The " inside the string should be replaced by ""
 * eg:
 *    "foo123" -> foo123            : legal
 *    "foo\n\r,123" -> foo\n\r,123  : legal
 *    "foo"123"                     : illegal
 *    "foo""123" -> foo"123         : legal
 */
public class CSVEscapeStringParser implements Parser {
  public final static char ESCAPE = '"';
  private static Parser newlineParser = new CSVNewlineParser();

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
          //check for the newline
          if ( head == '\\') {
            PStream ps1 = ps.apply(newlineParser, x);
            if ( ps1 != null ) {
              sb.append(ps1.value());
              ps = ps1;
              delimCount = 0;
              continue;
            } else {
              delimCount = 0;
              sb.append("\\\\");
            }
          } else {
            delimCount = 0;
            sb.append(head);
          }
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