package foam.lib.query;

import foam.lib.parse.*;

public class DuringExpression
  extends ProxyParser {
  public DuringExpression() {
    setDelegate(new Seq1(1,
                         new Alt(new Literal(":"),
                                 new Literal("=")),
                         new DateRangeParser()));
  }

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);
    if ( ps == null ) return ps;

    Object[] result = (Object[])ps.value();

    foam.mlang.predicate.And expr = new foam.mlang.predicate.And();
    expr.setArgs(new foam.mlang.predicate.Predicate[] {
        new foam.mlang.predicate.Gte((foam.mlang.Expr)x.get("arg1"),
                                     (foam.mlang.Expr)result[0]),
        new foam.mlang.predicate.Lt((foam.mlang.Expr)x.get("arg1"),
                                    (foam.mlang.Expr)result[1])
      });

    return ps.setValue(expr);
  }
}
