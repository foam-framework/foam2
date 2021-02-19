package foam.lib.parse;

import java.util.List;

public class Alternate implements Parser {
  List<Parser> parsers;

  public Alternate(List args) {
    parsers = args;
  }

  public PStream parse(PStream ps, ParserContext x) {
    for ( Parser parser: parsers ) {
      PStream ret = ps.apply(parser, x);
      if ( ret != null ) return ret;
    }
    return null;
  }
}
