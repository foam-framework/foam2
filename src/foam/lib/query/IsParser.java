/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.query;

import foam.lib.parse.Literal;
import foam.lib.parse.PStream;
import foam.lib.parse.ParserContext;
import foam.lib.parse.Seq;

public class IsParser extends foam.lib.parse.ProxyParser {

public IsParser() {
  setDelegate(new Seq(new Literal("is:"), 
                      new FieldName()));
}

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);
    if ( ps == null || ps.value() == null ) return null;
    
    foam.mlang.predicate.Binary predicate = new foam.mlang.predicate.Eq();
    
    Object[] values = (Object[]) ps.value();
    foam.mlang.Expr arg1 = (foam.mlang.Expr) values[1];
    predicate.setArg1(arg1);
    predicate.setArg2(new foam.mlang.Constant(true));

    return ps.setValue(predicate);
  }
}
