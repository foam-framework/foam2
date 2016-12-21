package foam.lib.json;

import foam.lib.parse.*;

public class FloatParser implements Parser {
  public PStream parse(PStream ps, ParserContext x) {
    int n = 0;
    boolean negate = false;
    int d = 1; // decimal index 
    boolean decimalFound = false;

    if ( ! ps.valid() ) return null;

    char c = ps.head();

    if ( c == '-' ) {
      negate = true;
      ps = ps.tail();
      if ( ! ps.valid() ) return null;
      c = ps.head();
    }

    // Float numbers must start with a digit: 0.1, 4.0
    if ( Character.isDigit(c) )  n = Character.digit(c, 10);
    else return null;

    ps = ps.tail();

    while ( ps.valid() ) {
      c = ps.head();
      if ( Character.isDigit(c) ) {
        n *= 10;
        n += Character.digit(c, 10);
      } else if ( c == '.' ) { // TODO: localization
        if (decimalFound) {
          return null;
        }
        decimalFound = true;
      } else {
        break;
      }
      if ( ! decimalFound ) {
        d *= 10;
      }
      ps = ps.tail();
    }

    if ( negate ) n *= -1;

    return ps.setValue( n / d );
  }
}
