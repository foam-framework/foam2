/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;
import foam.core.*;

public class FObjectParser
    extends ObjectNullParser
{

  public FObjectParser(final Class defaultClass) {
    super(new Seq1(3,
        new Whitespace(),
        new Literal("{"),
        new Whitespace(),
        new Parser() {
          private Parser delegate = new Seq1(4,
              new KeyParser("class"),
              new Whitespace(),
              new Literal(":"),
              new Whitespace(),
              new StringParser(),
              new Optional(new Literal(",")));

          public PStream parse(PStream ps, ParserContext x) {
            try {
              PStream ps1 = ps.apply(delegate, x);
              Class c = ps1 != null ? Class.forName(ps1.value().toString()) : defaultClass;

              // return null if class not specified in JSON and no default class available
              if ( c == null ) {
                return null;
              }

              if ( ps1 != null ) ps = ps1;

              ParserContext subx = x.sub();

              Parser subParser;

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
              return null;
            }
          }
        },
        new Whitespace(),
        new Literal("}")));
  }

  public FObjectParser() {
    this(null);
  }
}
