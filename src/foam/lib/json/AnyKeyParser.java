/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;

public class AnyKeyParser extends ProxyParser {
  public AnyKeyParser() {
    super(new Alt(new StringParser(), 
                  new Substring(
                    new Seq0(
                      new Alt(new Range('A', 'z'), new Literal("_"), new Literal("$")), 
                      new Repeat0(new Alt(
                          new Range('0', '9'),
                          new Alt(new Range('A', 'z'), new Literal("_"), new Literal("$"))))))));
  }
}
