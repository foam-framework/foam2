package foam.lib.json;

import foam.lib.parse.*;
import foam.core.*;

public class FObjectParser extends ProxyParser {
  public FObjectParser() {
    super(new Seq1(7,
                   new Whitespace(),
                   new Literal("{"),
                   new Whitespace(),
                   new KeyParser("class"),
                   new Whitespace(),
                   new Literal(":"),
                   new Whitespace(),
                   new Parser() {
        private Parser delegate = new StringParser();
        public PStream parse(PStream ps, ParserContext x) {
          ps = delegate.parse(ps, x);
          if ( ps == null ) return null;

          Class c;

          try {
            c = Class.forName(ps.value().toString());
          } catch(ClassNotFoundException e) {
            throw new RuntimeException(e);
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
}
