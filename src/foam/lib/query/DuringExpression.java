package foam.lib.query;

import foam.lib.parse.Alt;
import foam.lib.parse.Literal;
import foam.lib.parse.PStream;
import foam.lib.parse.ParserContext;
import foam.lib.parse.ProxyParser;
import foam.lib.parse.Seq1;

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
        new foam.mlang.predicate.Gte.Builder(null)
          .setArg1((foam.mlang.Expr)x.get("arg1"))
          .setArg2((foam.mlang.Expr)result[0])
          .build(),
        new foam.mlang.predicate.Lt.Builder(null)
          .setArg1((foam.mlang.Expr)x.get("arg1"))
          .setArg2((foam.mlang.Expr)result[1])
          .build()
      });

    return ps.setValue(expr);
  }
}
