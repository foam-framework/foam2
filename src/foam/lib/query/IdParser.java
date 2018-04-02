/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.query;

import foam.lib.json.IntParser;
import foam.lib.parse.Literal;
import foam.lib.parse.PStream;
import foam.lib.parse.ParserContext;
import foam.lib.parse.Seq;
import foam.mlang.predicate.Binary;
import foam.nanos.auth.User;

public class IdParser extends foam.lib.parse.ProxyParser {

  public IdParser() {
    setDelegate(new Seq(new IntParser(),
                         new Literal(":me"))); 
  }
  
  @Override
  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);
    if ( ps == null || ps.value() == null ) return null;
    
    Binary predicate = new foam.mlang.predicate.Eq();
    Object[] values = (Object[]) ps.value();

    predicate.setArg1(User.ID);
    predicate.setArg2(new foam.mlang.Constant(values[0]));

    return ps.setValue(predicate);
  }
}
