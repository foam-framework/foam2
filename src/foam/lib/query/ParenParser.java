/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.query;

import foam.lib.parse.Literal;
import foam.lib.parse.PStream;
import foam.lib.parse.Parser;
import foam.lib.parse.ParserContext;
import foam.lib.parse.Seq1;
import foam.mlang.predicate.Predicate;

public class ParenParser extends foam.lib.parse.ProxyParser {

  public ParenParser(Parser valueParser) {
    setDelegate(new Seq1(1,
                         new Literal("("),
                         valueParser,
                         new Literal(")")));
  }

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);
    if ( ps == null ) return null;

    Predicate predicate = (Predicate) ps.value();

    if ( predicate != null ) { return ps.setValue(predicate); }
    return null;
  }
}
