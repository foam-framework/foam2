/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;
import foam.core.*;

public class FObjectParser extends ProxyParser {
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
                       PStream ps1 = ps.apply(delegate, x);

                       Class c;

                       try {

                         c = ps1 != null ? Class.forName(ps1.value().toString()) : defaultClass;
                         if ( c == null ) {
                           if ( ps1 != null ) throw new RuntimeException("Can't find class: " + ps1.value().toString());

                           throw new RuntimeException("No class specified in JSON and no defaultClass available.");
                         }
                       } catch(ClassNotFoundException e) {
                         throw new RuntimeException(e);
                       }

                       if ( ps1 != null ) {
                         ps = ps1;
                       }

                       ParserContext subx = x.sub();

                       Parser subParser;

                       if ( c.isEnum() ) {
                           subx.set("enum", c);
                           subParser = EnumParserFactory.getInstance(c);
                       } else {
                           Object obj = ((X)x.get("X")).create(c);
                           subx.set("obj", obj);
                           subParser = ModelParserFactory.getInstance(c);
                       }

                       ps = ps.apply(subParser, subx);

                       if ( ps != null ) {
                           return ps.setValue(subx.get("obj"));
                       }

                       return null;
                     }
                   },
                   new Whitespace(),
                   new Literal("}")));
  }

  public FObjectParser() {
    this(null);
  }
}
