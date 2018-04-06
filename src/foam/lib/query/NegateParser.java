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
import foam.mlang.predicate.Not;

public class NegateParser extends foam.lib.parse.ProxyParser  {

  public NegateParser(Parser exprParser) {
    setDelegate(new Alt(new Seq(new Literal("-"),
                                exprParser),
                        new Seq(new LiteralIC("NOT "),
                                exprParser)));
  }

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse ( ps, x );
    if ( ps == null || ps.value () == null ) return null;

    Object[] values = ( Object[] ) ps.value ();
    Not predicate = new foam.mlang.predicate.Not ();
    foam.mlang.predicate.Binary arg1 = ( foam.mlang.predicate.Eq ) values[1];
    predicate.setArg1 ( arg1 );

    return ps.setValue ( predicate );
  }
}
