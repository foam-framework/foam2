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
    Literal.create("\\r\\n"),
    Literal.create("\\r"),
    Literal.create("\\n")
  );

  public PStream parse(PStream ps, ParserContext x) {
    if ( ps == null ) return null;

    ps = ps.apply(delegate__, x);
    if ( ps == null ) return null;

    return ps.setValue("\n");
  }
}
