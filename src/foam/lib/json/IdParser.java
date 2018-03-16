/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.Literal;
import foam.lib.parse.ProxyParser;
import foam.lib.parse.Seq1;

public class IdParser
    extends ProxyParser
{
  public IdParser() {
    super(new Seq1(7,
        new Whitespace(),
        new Literal("{"),
        new Whitespace(),
        new KeyParser("id"),
        new Whitespace(),
        new Literal(":"),
        new Whitespace(),
        AnyParser.instance(),
        new Whitespace(),
        new Literal("}")
    ));
  }
}
