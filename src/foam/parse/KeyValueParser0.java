/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.parse;

import foam.lib.json.AnyKeyParser;
import foam.lib.json.Whitespace;
import foam.lib.parse.Literal;
import foam.lib.parse.ProxyParser;
import foam.lib.parse.Seq0;

public class KeyValueParser0
  extends ProxyParser
{
  public KeyValueParser0() {
    super(new Seq0(
                new Whitespace(),
                new AnyKeyParser(),
                new Whitespace(),
                new Literal("="),
                new AnyParser()));
  }
}
