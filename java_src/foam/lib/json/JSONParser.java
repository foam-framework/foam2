package foam.lib.json;

import foam.lib.parse.*;
import foam.core.FObject;

public class JSONParser {
  private Parser parser = new FObjectParser();
  private StringPS stringps = new StringPS();

  public FObject parseString(String data) {
    StringPS ps = stringps;

    ps.setString(data);
    ParserContext x = new ParserContextImpl();
    ps = (StringPS)parser.parse(ps, x);
    if ( ps != null ) return (FObject)ps.value();
    return null;
  }
}
