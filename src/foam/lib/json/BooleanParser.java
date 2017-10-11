/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;

public class BooleanParser extends ProxyParser {
  public BooleanParser() {
    super(new Alt(new Literal("true", true),
                  new Literal("false", false)));
  }
}
