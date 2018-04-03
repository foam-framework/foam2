/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.parse;

import foam.lib.json.AnyKeyParser;
import foam.lib.json.KeyParser;
import foam.lib.json.Whitespace;
import foam.lib.parse.Literal;
import foam.lib.parse.Parser;
import foam.lib.parse.ProxyParser;
import foam.lib.parse.Seq1;
import foam.lib.parse.Seq2;

public class KeyValueParser
  extends ProxyParser
{
  public KeyValueParser(String opt_key, Parser opt_valueParser) {
    super(opt_key != null ?
          new Seq1(5,
                   new Whitespace(),
                   new KeyParser(opt_key),
                   new Whitespace(),
                   new Literal("="),
                   new Whitespace(),
                   opt_valueParser != null ? opt_valueParser : new AnyParser()) :
          new Seq2(1, 5,
                   new Whitespace(),
                   new AnyKeyParser(),
                   new Whitespace(),
                   new Literal("="),
                   new Whitespace(),
                   opt_valueParser != null ? opt_valueParser : new AnyParser()));
  }
}
