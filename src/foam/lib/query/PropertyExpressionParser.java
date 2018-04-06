package foam.lib.query;

import foam.lib.parse.Alt;
import foam.lib.parse.Literal;
import foam.lib.parse.PStream;
import foam.lib.parse.ParserContext;
import foam.lib.parse.Seq1;


public class PropertyExpressionParser
  extends foam.lib.parse.ProxyParser {

  foam.core.PropertyInfo info_;

  public PropertyExpressionParser(foam.core.PropertyInfo prop) {
    info_ = prop;

    setDelegate(new Seq1(2,
                         new foam.lib.json.Whitespace(),
                         new Literal(prop.getName()),
                         new Alt(new EqualsParser(prop.queryParser()),
                                 new ContainParser(prop.queryParser()),
                                 new BeforeLteParser(prop.queryParser()),
                                 new BeforeLtParser(prop.queryParser()),
                                 new AfterGteParser(prop.queryParser()),
                                 new AfterGtParser(prop.queryParser()))));//new IdParser()
  }

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    x = x.sub();
    x.set("arg1", info_);

    return super.parse(ps, x);
  }
}
