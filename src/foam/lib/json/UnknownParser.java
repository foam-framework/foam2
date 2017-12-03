/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;

public class UnknownParser
  extends ProxyParser
{
  public UnknownParser() {
    super(new Alt(
        new NullParser(),
        new BooleanParser(),
        //double parser should be before LongParser()
        new DoubleParser(),
        new LongParser(),
        new StringParser(),
        new UnknownReferenceParser()));
  }
}