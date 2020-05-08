/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;

public class NullParser {
  private final static Parser instance__ = new Literal("null", null);

  public static Parser instance() { return instance__; }
}
