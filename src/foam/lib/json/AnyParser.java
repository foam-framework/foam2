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
          // parse long but fail if decimal is found
          new Seq1(0,
            new LongParser(),
            new Not(new Literal("."))),
          new DoubleParser(),
          new ObjectDateParser(),
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
