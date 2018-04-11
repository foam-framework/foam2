package foam.lib.query;

import foam.lib.parse.*;

public class OrParser
  extends foam.lib.parse.ProxyParser {
  public OrParser(Parser andParser) {
    setDelegate(new Repeat(andParser,
                           new Seq0(new foam.lib.json.Whitespace(),
                                    new Literal("OR"))));
  }

  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);
    if ( ps == null ) return ps;

    Object[] values = (Object[])ps.value();

    foam.mlang.predicate.Or or = new foam.mlang.predicate.Or();

    foam.mlang.predicate.Predicate[] args = new foam.mlang.predicate.Predicate[values.length];

    for ( int i = 0 ; i < args.length ; i++ ) {
      args[i] = (foam.mlang.predicate.Predicate)values[i];
    }

    or.setArgs(args);

    return ps.setValue(or);
  }
}
