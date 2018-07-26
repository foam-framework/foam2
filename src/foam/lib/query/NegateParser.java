/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.query;

import foam.lib.parse.Alt;
import foam.lib.parse.Literal;
import foam.lib.parse.LiteralIC;
import foam.lib.parse.PStream;
import foam.lib.parse.Parser;
import foam.lib.parse.ParserContext;
import foam.lib.parse.Seq;
import foam.lib.parse.Seq1;
import foam.mlang.predicate.Not;

public class NegateParser extends foam.lib.parse.ProxyParser  {

  public NegateParser(Parser exprParser) {
    setDelegate(new Alt(new Seq1(1,new Literal("-"),
                                exprParser),
                        new Seq1(1,new LiteralIC("NOT "),
                                exprParser)));
  }

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);
    if ( ps == null ) return null;

    Not predicate = new foam.mlang.predicate.Not();
    predicate.setArg1((foam.mlang.predicate.Binary) ps.value());

    return ps.setValue(predicate);
  }
}
