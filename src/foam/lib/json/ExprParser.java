/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

public class ExprParser
  extends foam.lib.parse.ProxyParser
{

  private final static Map    map__      = new ConcurrentHashMap();
  private final static Parser instance__ = new ExprParser();

  public static Parser instance() { return instance__; }

  /**
   * Implement the multiton pattern so we don't create the same
   * parser more than once.
   **/
  public static Parser create(Class cls) {
    if ( cls == null ) return instance();

    Parser p = (Parser) map__.get(cls.getName());

    if ( p == null ) {
      p = new ExprParser(cls);
      map__.put(cls.getName(), p);
    }

    return p;
  }

  private ExprParser() {
    this(null);
  }

  private ExprParser(final Class defaultClass) {
    super(new Alt(
      new PropertyReferenceParser(),
      ClassReferenceParser.instance(),
      ObjectDateParser.instance(),
      FObjectParser.create(defaultClass)));
  }
}
