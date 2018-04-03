/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.parse;

import foam.lib.parse.*;

public class IdentifierStartParser extends ProxyParser {
  public IdentifierStartParser() {
    super(new Alt(new Range('A', 'z'), new Literal("_"), new Literal("$")));
  }
}