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

public class AndParser
  extends foam.lib.parse.ProxyParser {
  public AndParser() {
    setDelegate(new Alt(new Repeat(ExpressionParser.instance(),
                                   new Alt(new LiteralIC("AND "),
                                           new Literal(" ")),
                                   -1),
                        ExpressionParser.instance()));
  }

  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);
    if ( ps == null || ps.value() == null ) return null;

    foam.mlang.predicate.And and = new foam.mlang.predicate.And();

    if ( ps.value() instanceof Object[] ) {
      Object[] values = (Object[]) ps.value();
      foam.mlang.predicate.Predicate[] args = new foam.mlang.predicate.Predicate[values.length];

      for ( int i = 0; i < values.length; i++ ) {
        args[i] = (foam.mlang.predicate.Predicate) values[i];
      }
      and.setArgs(args);
    } else {
      foam.mlang.predicate.Predicate[] args = new foam.mlang.predicate.Predicate[1];
      args[0] = (foam.mlang.predicate.Predicate) ps.value();

      and.setArgs(args);
    }
    return ps.setValue(and);
  }
}
