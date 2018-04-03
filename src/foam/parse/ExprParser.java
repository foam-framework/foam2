/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.parse;

import foam.lib.parse.Alt;

public class ExprParser extends foam.lib.parse.ProxyParser {
  public ExprParser() {
    this(null);
  }

  public ExprParser(Class defaultClass) {
    super(new Alt( new FObjectParser(defaultClass)));
  }
}
