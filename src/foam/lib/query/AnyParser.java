/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.query;

import foam.lib.json.NullParser;
import foam.lib.parse.Alt;
import foam.lib.parse.ProxyParser;

public class AnyParser
  extends ProxyParser
{

  private static AnyParser instance_ = null;
  public static AnyParser instance() {
    if ( instance_ == null ) {
      instance_ = new AnyParser();
      Alt delegate = new Alt(
          new LongParser(),
          new StringParser(),
          new NullParser());
      instance_.setDelegate(delegate);
    }
    return instance_;
  }
  private AnyParser() {}
}
