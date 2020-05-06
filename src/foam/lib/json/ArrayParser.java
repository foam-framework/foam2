/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;

public class ArrayParser
  extends ProxyParser
{
  private final static Parser instance__ = new ArrayParser();

  // Unusual definition of instance() to avoid circular references.
  public static Parser instance() { return instance__ == null ? new ProxyParser() { public Parser getDelegate() { return instance__; } } : instance__; }

  public ArrayParser() {
    super(new Seq1(3,
      Whitespace.instance(),
      Literal.create("["),
      Whitespace.instance(),
      new Repeat(
        AnyParser.instance(),
        new Seq0(Whitespace.instance(), Literal.create(","), Whitespace.instance())),
      Whitespace.instance(),
      Literal.create("]")));
  }
}
