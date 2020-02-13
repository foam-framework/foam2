/**
  * @license
  * Copyright 2017 The FOAM Authors. All Rights Reserved.
  * http://www.apache.org/licenses/LICENSE-2.0
  */

package foam.lib.json;

import foam.lib.parse.*;

public class KeyValueParser0
  extends ProxyParser
{
  public KeyValueParser0() {
    super(new Seq0(Whitespace.instance(),
                   new AnyKeyParser(),
                   Whitespace.instance(),
                   Literal.create(":"),
                   AnyParser.instance()));
  }
}
