/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;

//parse null string, when object is null
public abstract class ObjectNullParser
  extends ProxyParser
{
  public ObjectNullParser(Parser objectParser) {
    super(
      new Alt(
        new NullParser(),
        objectParser
      )
    );
  }
}