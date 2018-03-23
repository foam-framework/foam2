package foam.lib.query;

import foam.lib.parse.*;

public class ValueParser
  implements Parser {
  @Override
  public PStream parse(PStream ps, ParserContext x) {
    StringBuilder s = new StringBuilder();

    while ( ps.valid() ) {
      char c = ps.head();
      if ( c == ' ' ) break;
      ps = ps.tail();
      s.append(c);
    }

    return ps.setValue(new foam.mlang.Constant(s.toString()));
  }
}
