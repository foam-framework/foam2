/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.core.*;
import foam.lib.parse.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

public class FObjectParser
  extends ObjectNullParser
{
  private final static Map    map__      = new ConcurrentHashMap();
  private final static Parser instance__ = new FObjectParser();

  public static Parser instance() { return instance__ == null ? new ProxyParser() { public Parser getDelegate() { return instance__; } } : instance__; }

  /**
   * Implement the multiton pattern so we don't create the same
   * parser more than once.
   **/
  public static Parser create(Class cls) {
    if ( cls == null ) return instance();

    Parser p = (Parser) map__.get(cls.getName());

    if ( p == null ) {
      p = new FObjectParser(cls);
      map__.put(cls.getName(), p);
    }

    return p;
  }

  public FObjectParser(final Class defaultClass) {
    super(new Seq1(3,
      Whitespace.instance(),
      Literal.create("{"),
      Whitespace.instance(),
      new Parser() {
        private Parser delegate = new Seq1(4,
            new KeyParser("class"),
            Whitespace.instance(),
            Literal.create(":"),
            Whitespace.instance(),
            StringParser.instance(),
            new Optional(Literal.create(",")));

        public PStream parse(PStream ps, ParserContext x) {
          try {
            PStream ps1 = ps.apply(delegate, x);
            Class   c   = ( ps1 != null ) ?
              Class.forName(ps1.value().toString()) :
              defaultClass ;

            // return null if class not specified in JSON and no default class available
            if ( c == null ) return null;

            if ( ps1 != null ) ps = ps1;

            ParserContext subx = x.sub();
            Parser        subParser;

            if ( c.isEnum() ) {
              subx.set("enum", c);
              subParser = EnumParserFactory.getInstance(c);
            } else {
              Object obj = ((X) x.get("X")).create(c);
              subx.set("obj", obj);
              subParser = ModelParserFactory.getInstance(c);
            }

            ps = ps.apply(subParser, subx);

            if ( ps != null ) {
              return ps.setValue(subx.get("obj"));
            }

            return null;
          } catch (Throwable t) {
            t.printStackTrace();
            return null;
          }
        }
      },
      Whitespace.instance(),
      Literal.create("}")));
  }

  public FObjectParser() {
    this(null);
  }
}
