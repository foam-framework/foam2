package foam.lib.query;

import foam.lib.parse.*;

public class QueryParser
  extends foam.lib.parse.ProxyParser {
  private foam.core.ClassInfo info_;

  public QueryParser(foam.core.ClassInfo info) {
    info_ = info;
    setDelegate(new OrParser());
  }

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    x = x.sub();
    x.set("classInfo", info_);

    return super.parse(ps, x);
  }
}
