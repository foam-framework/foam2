/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.query;

import foam.lib.parse.Alt;
import foam.lib.parse.PStream;
import foam.lib.parse.ParserContext;

public class CompoundValue extends foam.lib.parse.ProxyParser {

  public CompoundValue() {
    setDelegate(new Alt(new NegateValue(),
                        new OrValue(),
                        new AndValue()));
  }

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse ( ps, x );
    if ( ps == null || ps.value () == null ) return null;

    return ps.setValue ( ps.value () );
  }
}
