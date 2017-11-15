/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.core.*;
import foam.lib.parse.*;

public class ExprParser
    extends foam.lib.parse.ProxyParser
{
  public ExprParser() {
    this(null);
  }

  public ExprParser(final Class defaultClass) {
    super(new Alt(new PropertyReferenceParser(), new FObjectParser(defaultClass)));
  }
}
