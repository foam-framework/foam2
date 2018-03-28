package foam.lib.query;

import foam.lib.parse.*;

public class EqExpression
  extends ProxyParser {
  public EqExpression() {
    setDelegate(new Alt(new Literal(">"),
                        new Literal(":")));
  }

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);
    if ( ps == null ) return ps;

    return ps.setValue(new foam.mlang.predicate.Eq());
  }
}
