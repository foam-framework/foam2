/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;

public class DoubleParser
  implements Parser
{
  // TODO: Make the FloatParser share this code/design
  public PStream parse(PStream ps, ParserContext x) {
    boolean negative   = false;
    double  placeValue = 1.0;
    double  value      = 0.0;

    if ( ! ps.valid() ) return null;

    char c = ps.head();

    if ( c == '-' )  {
      negative = true;
      ps = ps.tail();
      if ( ! ps.valid() ) return null;
      c = ps.head();
    }

    // Double numbers must start with a digit: 0.1, 4.0
    if ( Character.isDigit(c) )
      value = c - '0';
    else
      return null;

    ps = ps.tail();

    while ( ps.valid() ) {
      c = ps.head();
      if ( Character.isDigit(c) ) {
        if ( placeValue < 1.0 ) {
          value += (c - '0') * placeValue;
          placeValue /= 10.0;
        } else {
          value = value * 10 + c - '0';
        }
      } else if ( c == '.' ) { // TODO: localization
        if ( placeValue < 1.0 ) return null;
        placeValue = 0.1;
      } else {
        break;
      }
      ps = ps.tail();
    }

    return ps.setValue(negative ? -value : value);
  }
}
