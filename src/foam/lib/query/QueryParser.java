package foam.lib.query;

import foam.lib.parse.*;

public class QueryParser
  extends foam.lib.parse.ProxyParser {
  private foam.core.ClassInfo info_;

  public QueryParser(foam.core.ClassInfo classInfo) {
    info_ = classInfo;

    java.util.List properties = classInfo.getAxiomsByClass(foam.core.PropertyInfo.class);

    Parser[] expressions = new Parser[properties.size()];

    int i = 0;
    for ( Object prop : properties ) {
      foam.core.PropertyInfo info = (foam.core.PropertyInfo)prop;

      expressions[i++] = new PropertyExpressionParser(info);
    }

    setDelegate(new OrParser(new AndParser(new Alt(expressions))));
  }

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    x = x.sub();
    x.set("classInfo", info_);

    return super.parse(ps, x);
  }
}
