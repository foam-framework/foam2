/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.parse;

import foam.lib.json.Whitespace;
import foam.lib.parse.*;

public class FObjectArrayParser extends ProxyParser {
  public FObjectArrayParser() {
    this(null);
  }

  public FObjectArrayParser(final Class defaultClass) {
    super(new Seq1(3,
        new Whitespace(),
        new Literal("["),
        new Whitespace(),
        new Repeat(
            new ExprParser(defaultClass),
            new Seq0(new Whitespace(),
                new Literal(","),
                new Whitespace())),
        new Whitespace(),
        new Literal("]")));
  }
}
