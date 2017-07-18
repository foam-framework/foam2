/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;

public class AnyKeyParser extends ProxyParser {
  public AnyKeyParser() {
    super(new Alt(
                  new Seq1(1,
                           new Literal("\""),
                           new Substring(new Repeat0(new NotChars("\""))),
                           new Literal("\"")),
                  new Seq1(0,
                           new Substring(new Repeat0(new NotChars(" :{}"))))));
  }
}
