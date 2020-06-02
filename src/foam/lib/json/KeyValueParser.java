/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;

public class KeyValueParser
  extends ProxyParser
{
  public KeyValueParser(String opt_key, Parser opt_valueParser) {
    super(opt_key != null ?
      new Seq1(5,
        Whitespace.instance(),
        new KeyParser(opt_key),
        Whitespace.instance(),
        Literal.create(":"),
        Whitespace.instance(),
        opt_valueParser != null ? opt_valueParser : AnyParser.instance()) :
      new Seq2(1, 5,
        Whitespace.instance(),
        new AnyKeyParser(),
        Whitespace.instance(),
        Literal.create(":"),
        Whitespace.instance(),
        opt_valueParser != null ? opt_valueParser : AnyParser.instance()));
  }
}
