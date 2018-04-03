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
import foam.lib.parse.Repeat;

public class OrParser
  extends foam.lib.parse.ProxyParser {
  public OrParser() {
    setDelegate(new Alt(new Repeat(new AndParser(),
                                   new Alt(new LiteralIC("OR "), 
                                           new Literal("| "))
                                   ,1)));
  }

  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);
    if ( ps == null || ps.value() == null) return null;

    Object[] values = (Object[])ps.value();
    foam.mlang.predicate.Or or = new foam.mlang.predicate.Or();

    foam.mlang.predicate.Predicate[] args = new foam.mlang.predicate.Predicate[values.length];
    for ( int i = 0 ; i < args.length ; i++ ) {
      args[i] = (foam.mlang.predicate.Predicate)values[i];
    }
    or.setArgs(args);
    return ps.setValue(or);
  }
}
