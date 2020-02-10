/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;

public class ListParser
  extends ProxyParser
{
  public ListParser() {
    super(new Alt(
      new NullParser(),
      new Seq1(3,
               Whitespace.instance(),
               Literal.create("["),
               Whitespace.instance(),
               new Repeat(
                          AnyParser.instance(),
                          new Seq0(Whitespace.instance(), Literal.create(","), Whitespace.instance())),
               Whitespace.instance(),
               Literal.create("]"))));
  }

  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);

    if ( ps != null && ps.value() != null ) {
      ps = ps.setValue(new java.util.ArrayList(java.util.Arrays.asList((Object[])ps.value())));
    }

    return ps;
  }
}
