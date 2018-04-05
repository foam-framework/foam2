package foam.lib.query;

import foam.lib.parse.*;

public class PropertyExpressionParser
  extends foam.lib.parse.ProxyParser {

  foam.core.PropertyInfo info_;

  public PropertyExpressionParser(foam.core.PropertyInfo prop) {
    info_ = prop;

    setDelegate(new Seq1(2,
                         new foam.lib.json.Whitespace(),
                         new Literal(prop.getName()),
                         // TODO: There should probably be a better way to detect Date
                         // properties, but this works for now.
                         prop.getValueClass().equals(java.util.Date.class) ?
                         new Alt(new DuringExpression(),
                                 new LtExpression(new DateParser()),
                                 new GtExpression(new DateParser())) :
                         // TODO: Let the property produce it's own ValueParser
                         new Alt(new LtExpression(new ValueParser()),
                                 new EqExpression(new ValueParser()),
                                 new GtExpression(new ValueParser()))));
  }

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    x = x.sub();
    x.set("arg1", info_);

    return super.parse(ps, x);
  }
}
