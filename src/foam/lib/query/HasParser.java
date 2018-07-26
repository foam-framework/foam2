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
import foam.mlang.predicate.Has;

public class HasParser extends foam.lib.parse.ProxyParser {

  foam.core.PropertyInfo info_;

  public HasParser(foam.core.PropertyInfo prop) {
    info_ = prop;

    setDelegate(new Seq(new Literal("has:"),
                        new Literal(prop.getName())));
  }

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);
    if ( ps == null ) return ps;

    Has predicate = new foam.mlang.predicate.Has();
    predicate.setArg1(info_);

    return ps.setValue(predicate);
  }
}