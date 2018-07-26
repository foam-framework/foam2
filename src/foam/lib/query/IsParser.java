/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.query;

import foam.lib.parse.Literal;
import foam.lib.parse.PStream;
import foam.lib.parse.ParserContext;
import foam.lib.parse.Seq;

public class IsParser extends foam.lib.parse.ProxyParser {

  foam.core.PropertyInfo info_;

public IsParser(foam.core.PropertyInfo prop) {
  info_ = prop;
  
  setDelegate(new Seq(new Literal("is:"),
                      new Literal(prop.getName())));
 }

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse ( ps, x );
    if ( ps == null ) return ps;

    foam.mlang.predicate.Binary predicate = new foam.mlang.predicate.Eq ();
    predicate.setArg1 ( info_ );
    predicate.setArg2 ( new foam.mlang.Constant ( true ) );

    return ps.setValue ( predicate );
  }
}
