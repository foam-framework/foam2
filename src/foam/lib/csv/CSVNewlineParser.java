/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.csv;

import foam.lib.parse.*;

public class CSVNewlineParser
  implements Parser
{

  static Parser delegate__ = new Alt(
    new Seq0(Literal.create("\\"), Literal.create("r"), Literal.create("\\"), Literal.create("n")),
    new Seq0(Literal.create("\\"), Literal.create("r")),
    new Seq0(Literal.create("\\"), Literal.create("n"))
  );

  public PStream parse(PStream ps, ParserContext x) {
    if ( ps == null ) return null;

    ps = ps.apply(delegate__, x);
    if ( ps == null ) return null;

    return ps.setValue("\n");
  }
}
