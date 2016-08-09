package foam.lib.json;

import foam.lib.parse.*;

public class IntParser implements Parser {
  public PStream parse(PStream ps, ParserContext x) {
    int n = 0;

    boolean negate = false;

    while ( ps.valid() ) {
      char c = ps.head();

      if ( c == '-' ) {
        negate = true;
      } else if ( Character.isDigit(c) ) {
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
