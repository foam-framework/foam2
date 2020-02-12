/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;

public class ASCIIEscapeParser
  extends ProxyParser
{

  public ASCIIEscapeParser() {
    super(new Seq(
      Whitespace.instance(),
      Literal.create("\\"),
      new Alt(
        Literal.create("\\"),
        Literal.create("n"),
        Literal.create("t"),
        Literal.create("r"),
        Literal.create("f"),
        Literal.create("b"))));
  }

  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);

    if ( ps != null ) {
      Object[] values = (Object[]) ps.value();

      char c = values[2].toString().charAt(0);

      switch ( c ) {
        case '\\': c = '\\';
          break;
        case 'n': c = '\n';
          break;
        case 't': c = '\t';
          break;
        case 'r': c = '\r';
          break;
        case 'f': c = '\f';
          break;
        case 'b': c = '\b';
          break;
      }

      return ps.setValue(Character.valueOf(c));
    }

    return ps;
  }
}
