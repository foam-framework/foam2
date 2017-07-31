/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;

public class StringParser implements Parser {
  private char delim_;
  private char escape_;

  public StringParser() {
    escape_ = '\\';
  }

  public PStream isNull(PStream ps) {
    // Is there a neater way to do this?
    if ( ps.head() == 'n' &&
          ( ps.tail().valid() && ps.tail().head() == 'u' ) && 
          ( ps.tail().tail().valid() && ps.tail().tail().head() == 'l' ) && 
          ( ps.tail().tail().tail().valid() && ps.tail().tail().tail().head() == 'l' ) ) {
      return ps.tail().tail().tail().tail().setValue("");
    }

    return null;
  }

  public PStream parse(PStream ps, ParserContext x) {
    delim_ = ps.head();
    if ( delim_ != '"' && delim_ != '\'' ) {
      return isNull(ps);
    }

    ps = ps.tail();
    char lastc = delim_;

    StringBuilder sb = new StringBuilder();

    while ( ps.valid() ) {
      char c = ps.head();
      if ( c == delim_ && lastc != escape_ ) {
        break;
      }

      if ( c != escape_ ) sb.append(c);

      PStream tail = ps.tail();

      if ( c == '\\' ) {
        char nextChar = ps.tail().head();
        Parser escapeSeqParser = null;

        if ( nextChar == 'u' ) {
          escapeSeqParser = new UnicodeParser();
        } else if ( nextChar == 'n' ) {
          escapeSeqParser = new ASCIIEscapeParser();
        }

        if ( escapeSeqParser != null ) {
          PStream escapePS = escapeSeqParser.parse(ps, x);

          if ( escapePS != null ) {
            sb.append(escapePS.value());
            tail = escapePS;

            c = ((Character) escapePS.value()).charValue();
          }
        }
      }

      ps = tail;
      lastc = c;
    }

    return ps.tail().setValue(sb.toString());
  }
}
