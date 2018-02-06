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

  private static AnyParser instance_ = null;
  public static AnyParser instance() {
    if ( instance_ == null ) {
      instance_ = new AnyParser();
      Alt delegate = new Alt(
          new NullParser(),
          new StringParser(),
          new BooleanParser(),
          new LongParser(),
          new DoubleParser(),
          new StringArrayParser(),
          new StringDoubleArrayParser(),
          new PropertyReferenceParser(),
          new ArrayParser(),
          new FObjectParser(),
          new MapParser());
      instance_.setDelegate(delegate);
    }
    return instance_;
  }
  private AnyParser() {}
}
