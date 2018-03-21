package foam.lib.query;

import foam.lib.parse.*;

public class LtExpression
  extends ProxyParser {
  public LtExpression() {
    setDelegate(new Literal("<"));
  }

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);
    if ( ps == null ) return ps;

    return ps.setValue(new foam.mlang.predicate.Lt());
  }
}
