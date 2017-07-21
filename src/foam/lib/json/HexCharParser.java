/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;

public class HexCharParser extends ProxyParser {
  public HexCharParser() {
    super(new Alt(new Range('0', '9'), new Range('A', 'F'), new Range('a', 'f')));
  }
}
