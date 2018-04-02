/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.query;

import foam.lib.parse.Alt;
import foam.lib.parse.PStream;
import foam.lib.parse.ParserContext;

public class ExpressionParser
  extends foam.lib.parse.ProxyParser {
  private static ExpressionParser instance_ = null;
  public static ExpressionParser instance() {
    
    if ( instance_ == null ) {
      instance_ = new ExpressionParser();
      Alt delegate = new Alt(
            new ParenParser(),
            new NegateParser(),
            new HasParser(),
            new IsParser(),
            new EqualsParser(),
            new BeforeParser(),
            new AfterParser(),
            new IdParser()
          );
      instance_.setDelegate(delegate);
    }
    return instance_;
  }
  
  private ExpressionParser() {}

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);
    if ( ps == null || ps.value() == null ) return null;
    return ps.setValue(ps.value());
  }
}
