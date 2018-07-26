/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;

public class UnicodeParser extends ProxyParser {
  public UnicodeParser() {
    super(new Seq(new Whitespace(),
                  new Literal("\\"),
                  new Literal("u"),
                  new Repeat(new HexCharParser(), null, 4, 4)));
  }

  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);

    if ( ps != null ) {
      Object[] values = (Object[]) ps.value();

      // Gets the repeated hex char sequence
      values = (Object[]) values[3];

      char hexChar = (char) ( hexToInt(values[0], 3) +
                              hexToInt(values[1], 2) +
                              hexToInt(values[2], 1) +
                              hexToInt(values[3], 0) );

      return ps.setValue(Character.valueOf(hexChar));
    }

    return ps;
  }

  public static int hexToInt(Object o, int power) {
    char c = o.toString().charAt(0);

    // Converts to upper case if necessary
    if ( c >= 'a' && c <= 'z' ) {
      c = Character.toUpperCase(c);
    }

    return ( c <= '9' ? c - '0' : 10 + c - 'A' ) * (int) Math.pow(16, power);
  }
}
