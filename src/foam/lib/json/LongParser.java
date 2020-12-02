/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;

public class LongParser
  implements Parser
{
  private final static Parser instance__ = new LongParser();

  public static Parser instance() { return instance__; }

  // TODO: make private
  public LongParser() {
  }

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

    if ( Character.isDigit(c) )
      n = Character.digit(c, 10);
    else
      return null;

    ps = ps.tail();

    while ( ps.valid() ) {
      c = ps.head();
      if ( Character.isDigit(c) ) {
        n *= 10;
        n += Character.digit(c, 10);
      } else {
        break;
      }
      ps = ps.tail();
    }

    if ( negate ) n *= -1;

    return ps.setValue(n);
  }
}
