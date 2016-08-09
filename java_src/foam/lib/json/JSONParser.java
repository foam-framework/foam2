package foam.lib.json;

import foam.lib.parse.*;
import foam.core.FObject;

public class JSONParser {
  private Parser parser = new Seq0(new Whitespace(),
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
          x.set("obj", c.newInstance());
          System.out.println("Parsing: " + c.getName());
          return ModelParserFactory.getInstance(c).parse(ps, x);
        } catch(Exception e) {
          // TODO: Handle error.
          throw new RuntimeException(e);
        }

      }
    },
                                   new Whitespace(),
                                   new Literal("}"));


  private StringPS stringps = new StringPS();

  public FObject parseString(String data) {
    StringPS ps = stringps;

    ps.setString(data);
    ParserContext x = new ParserContextImpl();
    ps = (StringPS)parser.parse(ps, x);
    if ( ps != null ) {
      return (FObject)x.get("obj");
    }
    return null;
  }
}
