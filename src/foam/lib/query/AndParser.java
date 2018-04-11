package foam.lib.query;

import foam.lib.parse.*;

public class AndParser
  extends foam.lib.parse.ProxyParser {
  public AndParser(Parser exprParser) {
    setDelegate(new Repeat(exprParser,
                           new Seq0(new foam.lib.json.Whitespace(),
                                    new Not(new Literal("OR")))));
  }

  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);
    if ( ps == null ) return ps;

    foam.mlang.predicate.And and = new foam.mlang.predicate.And();

    Object[] values = (Object[])ps.value();

    foam.mlang.predicate.Predicate[] args = new foam.mlang.predicate.Predicate[values.length];

    for ( int i = 0 ; i < values.length ; i++ ) {
      args[i] = (foam.mlang.predicate.Predicate)values[i];
    }

    and.setArgs(args);

    return ps.setValue(and);
  }
}
