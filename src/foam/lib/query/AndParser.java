package foam.lib.query;

import foam.lib.parse.Alt;
import foam.lib.parse.Literal;
import foam.lib.parse.LiteralIC;
import foam.lib.parse.Not;
import foam.lib.parse.PStream;
import foam.lib.parse.Parser;
import foam.lib.parse.ParserContext;
import foam.lib.parse.Repeat;
import foam.lib.parse.Seq0;

public class AndParser
  extends foam.lib.parse.ProxyParser {
  public AndParser(Parser exprParser) {
    setDelegate(new Repeat(exprParser,
                           new Seq0(new foam.lib.json.Whitespace(),
                                    new Alt(new LiteralIC("AND "),
                                            new Not(new LiteralIC("OR"))))));
  }

  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);
    if ( ps == null ) return ps;

    foam.mlang.predicate.And and = new foam.mlang.predicate.And();

    Object[] values = (Object[]) ps.value();

    foam.mlang.predicate.Predicate[] args = new foam.mlang.predicate.Predicate[values.length];

    for ( int i = 0 ; i < values.length ; i++ ) {
      args[i] = (foam.mlang.predicate.Predicate) values[i];
    }

    and.setArgs(args);

    return ps.setValue(and);
  }
}
