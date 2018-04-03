/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.query;

import foam.lib.parse.PStream;
import foam.lib.parse.ParserContext;

public class QueryParser
  extends foam.lib.parse.ProxyParser {
  private static foam.core.ClassInfo info_;

  public QueryParser(foam.core.ClassInfo info) {
    info_ = info;
    setDelegate(new OrParser());
  }
  
  public QueryParser() {
    setDelegate(new OrParser());
  }

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    x = x.sub();
    x.set("classInfo", info_);

    return super.parse(ps, x);
  }
}
