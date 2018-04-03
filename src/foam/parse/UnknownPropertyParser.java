/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.parse;

import foam.lib.parse.ProxyParser;


public class UnknownPropertyParser
  extends ProxyParser
  {
    public UnknownPropertyParser() {
      super(new KeyValueParser0());
  }
}
