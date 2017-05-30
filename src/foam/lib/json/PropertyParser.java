package foam.lib.json;

import foam.core.PropertyInfo;
import foam.lib.parse.*;

public class PropertyParser extends ProxyParser {
  private PropertyInfo property;

  public PropertyParser(PropertyInfo p) {
    super(
          new Seq1(5,
                   new Whitespace(),
                   new KeyParser(p.getName()),
                   new Whitespace(),
                   new Literal(":"),
                   new Whitespace(),
                   p.jsonParser(),
                   new Whitespace()));
    property = p;
  }

  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);
    if ( ps == null ) return null;
    property.set(x.get("obj"), ps.value());
    return ps;
  }
}
