/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;

public class AnyKeyParser
  extends ProxyParser
{
  public AnyKeyParser() {
    super(new Alt(new StringParser(),
      new Substring(
        new Seq0(
          // TODO: Implement Java Grammar support (so separate files aren't needed)
          new IdentifierStartParser(),
          new Repeat0(new Alt(
            new Range('0', '9'),
            new IdentifierStartParser()))))));
  }
}
