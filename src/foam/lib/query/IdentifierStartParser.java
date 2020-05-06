/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.query;

import foam.lib.parse.Alt;
import foam.lib.parse.Literal;
import foam.lib.parse.ProxyParser;
import foam.lib.parse.Range;

public class IdentifierStartParser extends ProxyParser {
  public IdentifierStartParser() {
    super(new Alt(Range.create('A', 'z'), Literal.create("_"), Literal.create("$")));
  }
}