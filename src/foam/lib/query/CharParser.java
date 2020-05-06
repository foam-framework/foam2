/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.query;

import foam.lib.parse.Alt;
import foam.lib.parse.Literal;
import foam.lib.parse.PStream;
import foam.lib.parse.ParserContext;
import foam.lib.parse.Range;

public class CharParser
  extends foam.lib.parse.ProxyParser
{

  public CharParser() {
    setDelegate(
      new Alt(Range.create('A', 'z'), Range.create('0', '9'), Literal.create("-"), Literal.create("^"),
          Literal.create("_"), Literal.create("@"), Literal.create("%"), Literal.create("."))
      );
  }

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse( ps, x );
    if ( ps == null ) return null;

    return ps;
  }
}
