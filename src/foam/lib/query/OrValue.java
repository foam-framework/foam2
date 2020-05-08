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
import foam.lib.parse.Seq;

public class OrValue
  extends foam.lib.parse.ProxyParser
{

  public OrValue() {
    setDelegate(
      new Seq(
        Literal.create("("),
        new Repeat(new ValueParser(), new Alt(Literal.create("|"), new LiteralIC(" or "), Literal.create(" | ")), 1),
        Literal.create(")")
      ));
  }

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);
    if ( ps == null ) return null;

    Object[] values = (Object[]) ps.value();
    Object[] args = new Object[( (Object[]) values[1] ).length];
    for ( int i = 0; i < args.length; i++ ) {
      args[i] = ( (Object[]) values[1] )[i];
    }

    return ps.setValue(args);
  }
}
