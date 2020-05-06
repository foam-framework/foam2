/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;

public class HexCharParser extends ProxyParser {
  public HexCharParser() {
    super(new Alt(Range.create('0', '9'), Range.create('A', 'F'), Range.create('a', 'f')));
  }
}
