package foam.lib.json;

import foam.lib.parse.*;
import foam.core.*;

public class JSONParser extends foam.core.ContextAwareSupport {
  private Parser parser = new FObjectParser();
  private StringPS stringps = new StringPS();

  public FObject parseString(String data) {
    return parseString(data, null);
  }

  public FObject parseString(String data, Class defaultClass) {
    StringPS ps = stringps;

    ps.setString(data);
    ParserContext x = new ParserContextImpl();
    x.set("X", getX());
    x.set("defaultClass", defaultClass);
    ps = (StringPS)parser.parse(ps, x);
    if ( ps != null ) return (FObject)ps.value();
    return null;
  }
}
