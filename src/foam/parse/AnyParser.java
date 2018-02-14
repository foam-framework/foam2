/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.parse;

import foam.lib.json.BooleanParser;
import foam.lib.json.DoubleParser;
import foam.lib.json.LongParser;
import foam.lib.json.NullParser;
import foam.lib.parse.Alt;
import foam.lib.parse.ProxyParser;

public class AnyParser extends ProxyParser {
  private static AnyParser instance_ = null;

  public static AnyParser instance() {
    if (instance_ == null) {
      instance_ = new AnyParser();
      Alt delegate = new Alt(
          new NullParser(),
          new BooleanParser(),
          new LongParser(),
          new DoubleParser(),
          new FObjectParser(),
          new StringParser());
      instance_.setDelegate(delegate);
    }
    return instance_;
  }

  public AnyParser() {
  }
}
