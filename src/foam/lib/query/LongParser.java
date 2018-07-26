/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.query;

import foam.lib.parse.PStream;
import foam.lib.parse.Parser;
import foam.lib.parse.ParserContext;

public class LongParser implements Parser {
  public PStream parse(PStream ps, ParserContext x) {
    long n = 0;

    boolean negate = false;

    if ( ! ps.valid() ) return null;

    char c = ps.head();

    if ( c == '-' ) {
      negate = true;
      ps = ps.tail();
      if ( ! ps.valid() ) return null;
      c = ps.head();
    }

    if ( Character.isDigit(c) ) n = Character.digit(c, 10);
    else return null;

    ps = ps.tail();

    while ( ps.valid() ) {
      c = ps.head();
      if ( Character.isDigit(c) ) {
        n *= 10;
        n += Character.digit(c, 10);
      }  else if (c == '-' || c == '/'){
        return null;
      } else break;
      ps = ps.tail();
    }

    if ( negate ) n *= -1;

    return ps.setValue(n);
  }
}
