/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;

public class ArrayParser
  extends ProxyParser
{
  public ArrayParser() {
    super(new Seq1(3,
      Whitespace.instance(),
      Literal.create("["),
      Whitespace.instance(),
      new Repeat(
        AnyParser.instance(),
        new Seq0(Whitespace.instance(), Literal.create(","), Whitespace.instance())),
      Whitespace.instance(),
      Literal.create("]")));
  }
}
