package foam.lib.query;

import foam.lib.parse.PStream;
import foam.lib.parse.Parser;
import foam.lib.parse.ParserContext;

public class PropertyNameParser
  implements Parser {
  @Override
  public PStream parse(PStream ps, ParserContext x) {
    PStream start = ps;

    while ( ps.valid() ) {
      char c = ps.head();
      if ( c == ':' ||
           c == '=' ||
           c == '<' ||
           c == '>' ) break;
      ps = ps.tail();
    }

    String name = start.substring(ps);

    foam.core.PropertyInfo prop =
      (foam.core.PropertyInfo)((foam.core.ClassInfo)x.get("classInfo")).getAxiomByName(name);

    return ps.setValue(prop);
  }
}
