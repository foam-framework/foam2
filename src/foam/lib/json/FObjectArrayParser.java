/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;

public class FObjectArrayParser extends ObjectNullParser {
  public FObjectArrayParser() {
    this(null);
  }

  public FObjectArrayParser(final Class defaultClass) {
    super(new Seq1(3,
        new Whitespace(),
        new Literal("["),
        new Whitespace(),
        new Repeat(
            // Parses Alt(__Property__, FObject)
            new ExprParser(defaultClass),
            new Seq0(new Whitespace(),
                new Literal(","),
                new Whitespace())),
        new Whitespace(),
        new Literal("]")));
  }
}
