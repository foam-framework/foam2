package foam.lib.query;

import foam.lib.parse.Alt;
import foam.lib.parse.Literal;
import foam.lib.parse.LiteralIC;
import foam.lib.parse.PStream;
import foam.lib.parse.Parser;
import foam.lib.parse.ParserContext;
import foam.lib.parse.Repeat;
import foam.lib.parse.Seq0;

public class OrParser
  extends foam.lib.parse.ProxyParser {
  public OrParser(Parser andParser) {
    setDelegate(new Repeat(andParser,
                           new Seq0(new foam.lib.json.Whitespace(),
                               new Alt(new LiteralIC("OR "),
                                   new Literal("| "))
                               )));
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
