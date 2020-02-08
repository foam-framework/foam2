/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;

public class StringDoubleArrayParser
  extends ProxyParser
{
  public StringDoubleArrayParser() {
    super(new Seq1(3,
    Whitespace.instance(),
    Literal.create("["),
    Whitespace.instance(),
    new Repeat(
      new StringArrayParser(),
      new Seq0(Whitespace.instance(), Literal.create(","), Whitespace.instance())),
    Whitespace.instance(),
    Literal.create("]")));
  }
}
