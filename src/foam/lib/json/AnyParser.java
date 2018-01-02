/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;

public class AnyParser
  extends ProxyParser
{
  public AnyParser() {
    super(new Alt(
        new NullParser(),
        new StringParser(),
        new BooleanParser(),
        new LongParser(),
        new DoubleParser(),
        new StringArrayParser(),
        new StringDoubleArrayParser(),
        new PropertyReferenceParser(),
        new FObjectParser()));
  }
}
