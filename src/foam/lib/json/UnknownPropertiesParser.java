/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;

public class UnknownPropertiesParser
  extends ProxyParser
{
  public UnknownPropertiesParser() {
    super(new Repeat0(new Seq0(new Whitespace(), new UnknownKeyValueParser0()),
                      new Literal(",")));
  }
}