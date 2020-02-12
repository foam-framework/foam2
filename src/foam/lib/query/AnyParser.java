/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.query;

import foam.lib.json.NullParser;
import foam.lib.parse.*;

public class AnyParser
  extends ProxyParser
{

  private static Parser instance__ = new AnyParser();

  public static Parser instance() { return instance__; }

  private AnyParser() {
    setDelegate(new Alt(
        LongParser.instance(),
        StringParser.instance(),
        NullParser.instance()));
  }

}
