package foam.lib.json;

import foam.lib.parse.*;

public class FloatParser implements Parser {
  public PStream parse(PStream ps, ParserContext x) {
    StringBuilder n = new StringBuilder();
    boolean decimalFound = false;

    if ( ! ps.valid() ) return null;

    char c = ps.head();

    if ( c == '-' ) {
      n.append(c);
      ps = ps.tail();
      if ( ! ps.valid() ) return null;
      c = ps.head();
    }

    // Float numbers must start with a digit: 0.1, 4.0
    if ( Character.isDigit(c) ) n.append(c);
    else return null;

    ps = ps.tail();

    while ( ps.valid() ) {
      c = ps.head();
      if ( Character.isDigit(c) ) {
          n.append(c);
      } else if ( c == '.' ) { // TODO: localization
        if (decimalFound) {
          return null;
        }
        decimalFound = true;
        n.append(c);
      } else {
        break;
      }
      ps = ps.tail();
    }

    return ps.setValue(n.length() > 0 ? Float.valueOf(n.toString()) : null);
  }
}
