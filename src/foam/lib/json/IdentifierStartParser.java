/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;

public class IdentifierStartParser extends ProxyParser {
  public IdentifierStartParser() {
    super(new Alt(Range.create('A', 'Z'), Range.create('a', 'z'), Literal.create("_"), Literal.create("$")));
  }
}
