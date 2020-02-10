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

  public static Parser instance() { return instance__; }

  private AnyParser() {
    setDelegate(new Alt(
      new NullParser(),
      StringParser.instance(),
      BooleanParser.instance(),
      // parse long but fail if decimal is found
      new Seq1(0,
        LongParser.instance(),
        new Not(Literal.create("."))),
      DoubleParser.instance(),
      new ObjectDateParser(),
      new StringArrayParser(),
      new StringDoubleArrayParser(),
      new PropertyReferenceParser(),
      new ClassReferenceParser(),
      new ArrayParser(),
      FObjectParser.instance(),
      new MapParser()));
  }
}
