package foam.lib.json;

import foam.lib.parse.*;
import foam.core.*;

public class JSONParser {
  private Parser parser = new FObjectParser();
  private StringPS stringps = new StringPS();

  private X x_;
  public JSONParser(X x) {
    x_ = x;
  }

  public FObject parseString(String data) {
    StringPS ps = stringps;

    ps.setString(data);
    ParserContext x = new ParserContextImpl();
    x.set("X", x_);
    ps = (StringPS)parser.parse(ps, x);
    if ( ps != null ) return (FObject)ps.value();
    return null;
  }
}
