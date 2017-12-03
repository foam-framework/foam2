/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;

public class UnknownArrayParser
  extends ProxyParser
{
  public UnknownArrayParser() {
    super(new Seq0(
      new Whitespace(),
      new Literal("["),
      new Whitespace(),
      new Repeat(
        new UnknownParser(),
        new Seq0(new Whitespace(), new Literal(","), new Whitespace())),
      new Whitespace(),
      new Literal("]")));
  }
}