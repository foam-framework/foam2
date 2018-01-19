/**
  * @license
  * Copyright 2017 The FOAM Authors. All Rights Reserved.
  * http://www.apache.org/licenses/LICENSE-2.0
  */

  package foam.lib.json;

import foam.lib.parse.*;

public class UnknownPropertyParser
  extends ProxyParser
{
  public UnknownPropertyParser() {
    super(new UnknownKeyValueParser0());
  }
}
