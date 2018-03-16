/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.csv;

import foam.lib.parse.*;

public class CSVNewlineParser implements Parser{
  private static Parser delegate = new Alt(
    new Seq0(new Literal("\\"), new Literal("r"), new Literal("\\"), new Literal("n")),
    new Seq0(new Literal("\\"), new Literal("r")),
    new Seq0(new Literal("\\"), new Literal("n"))
  );
  public PStream parse(PStream ps, ParserContext x) {
    if ( ps == null ) {
      return null;
    }
    ps = ps.apply(delegate, x);
    if ( ps == null ) {
      return null;
    }
    return ps.setValue("\n");
  }
}