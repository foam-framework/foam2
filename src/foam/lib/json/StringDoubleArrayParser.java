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
    new Whitespace(),
    new Literal("["),
    new Whitespace(),
    new Repeat(
      new StringArrayParser(),
      new Seq0(new Whitespace(), new Literal(","), new Whitespace())),
    new Whitespace(),
    new Literal("]")));
  }
}