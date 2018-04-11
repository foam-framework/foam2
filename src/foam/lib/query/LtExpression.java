package foam.lib.query;

import foam.lib.parse.*;

public class LtExpression
  extends ProxyParser {
  public LtExpression(Parser valueParser) {
    setDelegate(new Seq1(1,
                         new Literal("<"),
                         valueParser));
  }

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);
    if ( ps == null ) return ps;

    foam.mlang.predicate.Lt expr = new foam.mlang.predicate.Lt();
    expr.setArg1((foam.mlang.Expr)x.get("arg1"));
    expr.setArg2((foam.mlang.Expr)ps.value());

    return ps.setValue(expr);
  }
}
