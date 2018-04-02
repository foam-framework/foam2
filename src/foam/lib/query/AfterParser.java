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
import foam.lib.parse.ParserContext;
import foam.lib.parse.Seq;
import foam.mlang.Constant;

public class AfterParser extends foam.lib.parse.ProxyParser {
  
  public AfterParser() {
    setDelegate(new Seq(new FieldName(),
                        new Alt(new Literal(">="), 
                                new Literal(">"), 
                                new LiteralIC("-after:")),
                        new ValueParser()));
  }

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);
    if ( ps == null || ps.value() == null ) return null;

    Object[] values = (Object[]) ps.value();

    foam.mlang.predicate.Binary predicate = values[1].equals(">") ? new foam.mlang.predicate.Gt()
        : new foam.mlang.predicate.Gte();

    foam.mlang.Expr arg1 = (foam.mlang.Expr) values[0];
    foam.mlang.Expr arg2;

    if ( values[2] instanceof Constant[] ) {// in date case
      arg2 = (foam.mlang.Expr) ( (Constant[]) values[2] )[0];
    } else {
      arg2 = (foam.mlang.Expr) values[2];
    }

    predicate.setArg1(arg1);
    predicate.setArg2(arg2);

    return ps.setValue(predicate);
  }
}
