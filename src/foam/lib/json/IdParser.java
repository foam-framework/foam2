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
        Whitespace.instance(),
        Literal.create("{"),
        Whitespace.instance(),
        new KeyParser("id"),
        Whitespace.instance(),
        Literal.create(":"),
        Whitespace.instance(),
        AnyParser.instance(),
        Whitespace.instance(),
        Literal.create("}")
    ));
  }
}
