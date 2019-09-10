/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;

public class DoubleParser implements Parser {
  public PStream parse(PStream ps, ParserContext x) {
    StringBuilder n = new StringBuilder();
    boolean decimalFound = false;
    boolean exponentFound = false;

    if ( ! ps.valid() ) return null;

    char c = ps.head();

    if ( c == '-' ) {
      n.append(c);
      ps = ps.tail();
      if ( ! ps.valid() ) return null;
      c = ps.head();
    }

    // Double numbers must start with a digit: 0.1, 4.0
    if ( Character.isDigit(c) ) n.append(c);
    else return null;

    ps = ps.tail();

    while ( ps.valid() ) {
      c = ps.head();
      if ( Character.isDigit(c) ) {
        n.append(c);
      } else if ( c == '.' ) { // TODO: localization
        if ( decimalFound ) return null;

        // Java throws a NumberFormatException if exponent is before decimal.
        // Exponent with no decimal is acceptable.
        if ( exponentFound ) return null;

        decimalFound = true;
        n.append(c);
      } else if ( c == 'E' || c == 'e' ) {
        if ( exponentFound ) return null;
        exponentFound = true;
        n.append(c);
      } else {
        break;
      }
      ps = ps.tail();
    }

    return ps.setValue(n.length() > 0 ? Double.valueOf(n.toString()) : null);
  }
}
