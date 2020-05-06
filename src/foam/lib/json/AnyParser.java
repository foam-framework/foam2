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

  private static Parser instance__ = new AnyParser();

  public static Parser instance() { return instance__ == null ? new ProxyParser() { public Parser getDelegate() { return instance__; } } : instance__; }

  private AnyParser() {
    setDelegate(new Alt(
      NullParser.instance(),
      StringParser.instance(),
      BooleanParser.instance(),
      // parse long but fail if decimal is found
      new Seq1(0,
        LongParser.instance(),
        new Not(Literal.create("."))
      ),
      DoubleParser.instance(),
      StringArrayParser.instance(),
      new StringDoubleArrayParser(),
      new PropertyReferenceParser(),
      ObjectDateParser.instance(),
      ClassReferenceParser.instance(),
      ArrayParser.instance(),
      FObjectParser.instance(),
      MapParser.instance()));
  }
}
