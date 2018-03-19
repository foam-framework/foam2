package foam.lib.query;

import foam.lib.parse.*;

public class ExpressionParser
  extends foam.lib.parse.ProxyParser {

  public ExpressionParser() {
    setDelegate(new Seq(new foam.lib.json.Whitespace(),
                        new PropertyNameParser(),
                        new Alt(new LtExpression(),
                                new EqExpression(),
                                new GtExpression()),
                        new ValueParser()));
  }

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);
    if ( ps == null ) return ps;

    Object[] values = (Object[])ps.value();
    foam.mlang.predicate.Binary predicate = (foam.mlang.predicate.Binary)values[2];

    foam.mlang.Expr arg1 = (foam.mlang.Expr)values[1];
    foam.mlang.Expr arg2 = (foam.mlang.Expr)values[3];

    predicate.setArg1(arg1);
    predicate.setArg2(arg2);

    return ps.setValue(predicate);
  }
}
