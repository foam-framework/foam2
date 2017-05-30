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
                       PStream ps1 = delegate.parse(ps, x);

                       Class c;

                       try {

                         c = ps1 != null ? Class.forName(ps1.value().toString()) :
                           x.get("defaultClass") != null ? (Class)x.get("defaultClass") :
                           defaultClass;

                         if ( c == null ) {
                           throw new RuntimeException("No class specified in JSON and no defaultClass available.");
                         }
                       } catch(ClassNotFoundException e) {
                         throw new RuntimeException(e);
                       }

                       if ( ps1 != null ) {
                         ps = ps1;
                       }

                       ParserContext subx = x.sub();
                       Object obj = ((X)x.get("X")).create(c);
                       subx.set("obj", obj);

                       ps = ModelParserFactory.getInstance(c).parse(ps, subx);

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
