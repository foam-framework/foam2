package foam.lib.query;

import foam.lib.parse.Alt;
import foam.lib.parse.Literal;
import foam.lib.parse.PStream;
import foam.lib.parse.Parser;
import foam.lib.parse.ParserContext;
import foam.lib.parse.ProxyParser;
import foam.lib.parse.Seq1;

public class EqExpression
  extends ProxyParser {
  public EqExpression(Parser valueParser) {
    setDelegate(new Seq1(1,
                         new Alt(new Literal("="),
                                 new Literal(":")),
                         valueParser));
  }

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);
    if ( ps == null ) return ps;

    foam.mlang.predicate.Eq expr = new foam.mlang.predicate.Eq();
    expr.setArg1((foam.mlang.Expr)x.get("arg1"));
    expr.setArg2((foam.mlang.Expr)ps.value());

    return ps.setValue(expr);
  }
}
