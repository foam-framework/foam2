/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.query;

import java.util.Date;

import foam.lib.parse.Alt;
import foam.lib.parse.PStream;
import foam.lib.parse.ParserContext;
import foam.mlang.Constant;
import foam.parse.StringParser;

public class ValueParser extends foam.lib.parse.ProxyParser {

  public ValueParser() {
    setDelegate(new Alt(new MeParser(),
                        new LongParser(), 
                        new DateQueryParser(),
                        new StringParser()));
  }

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);
    if ( ps == null || ps.value() == null ) return null;

    if ( ps.value() instanceof Date[] ) {
      Constant d1 = new foam.mlang.Constant(( (Date[]) ps.value() )[0]);
      Constant d2 = new foam.mlang.Constant(( (Date[]) ps.value() )[1]);
      Constant[] d = { d1, d2 };
      return ps.setValue(d);
    }
    return ps.setValue(new foam.mlang.Constant(ps.value()));
  }
}
