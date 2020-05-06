/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import foam.lib.parse.*;

public class FObjectArrayParser extends ObjectNullParser {
  private final static Map    map__      = new ConcurrentHashMap();
  private final static Parser instance__ = new FObjectArrayParser();

  public static Parser instance() { return instance__ == null  ? new ProxyParser() { public Parser getDelegate() { return instance__; } } : instance__; }

  /**
   * Implement the multiton pattern so we don't create the same
   * parser more than once.
   **/
  public static Parser create(Class cls) {
    if ( cls == null ) return instance();

    Parser p = (Parser) map__.get(cls.getName());

    if ( p == null ) {
      p = new FObjectArrayParser(cls);
      map__.put(cls.getName(), p);
    }

    return p;
  }

  private FObjectArrayParser() {
    this(null);
  }

  private FObjectArrayParser(final Class defaultClass) {
    super(new Seq1(3,
      Whitespace.instance(),
      Literal.create("["),
      Whitespace.instance(),
      new Repeat(
        // Parses Alt(__Property__, FObject)
        ExprParser.create(defaultClass),
        new Seq0(Whitespace.instance(),
          Literal.create(","),
          Whitespace.instance())),
      Whitespace.instance(),
      Literal.create("]")));
  }
}
