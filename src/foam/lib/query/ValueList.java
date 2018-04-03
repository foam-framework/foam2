/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.query;

import foam.lib.parse.Alt;
import foam.lib.parse.Literal;
import foam.lib.parse.PStream;
import foam.lib.parse.ParserContext;
import foam.lib.parse.Repeat;

public class ValueList extends foam.lib.parse.ProxyParser {

  public ValueList() {
    setDelegate(new Alt(new CompoundValue(),
                        new Repeat(new ValueParser(),
                                   new Literal(","),
                                   1)));
  }

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);
    if ( ps == null || ps.value() == null ) return null;

    return ps.setValue(( (Object[]) ps.value() ));
  }
}
