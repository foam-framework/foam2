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


  public PStream parse(PStream ps, ParserContext x) {
    delim_ = ps.head();
    if ( delim_ != '"' && delim_ != '\'' ) {
      return null;
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
      
      if ( c == '\\' && ps.tail().head() == 'u' ) {
        Parser unicodeParser = new UnicodeParser();
        PStream unicodePS = unicodeParser.parse(ps, x);

        if ( unicodePS != null ) {
          sb.append(unicodePS.value());
          ps = unicodePS;

          c = ((Character) unicodePS.value()).charValue();
        } else {
          ps = ps.tail();
        }
      } else {
        ps = ps.tail();
      }

      lastc = c;
    }

    return ps.tail().setValue(sb.toString());
  }
}
