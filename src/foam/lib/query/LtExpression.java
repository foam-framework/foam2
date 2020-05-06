/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.query;

import foam.lib.parse.Literal;
import foam.lib.parse.PStream;
import foam.lib.parse.Parser;
import foam.lib.parse.ParserContext;
import foam.lib.parse.ProxyParser;
import foam.lib.parse.Seq1;

public class LtExpression
  extends ProxyParser
{

  public LtExpression(Parser valueParser) {
    setDelegate(new Seq1(1, Literal.create("<"), valueParser));
  }

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);

    if ( ps == null ) return ps;

    foam.mlang.predicate.Lt expr = new foam.mlang.predicate.Lt();
    expr.setArg1((foam.mlang.Expr) x.get("arg1"));
    expr.setArg2((foam.mlang.Expr) ps.value());

    return ps.setValue(expr);
  }
}
