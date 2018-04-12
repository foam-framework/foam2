/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.query;

import foam.lib.parse.Alt;
import foam.lib.parse.Literal;
import foam.lib.parse.LiteralIC;
import foam.lib.parse.PStream;
import foam.lib.parse.ParserContext;
import foam.lib.parse.Seq;

public class NegateValue extends foam.lib.parse.ProxyParser {

  public NegateValue() {
    setDelegate(
        new Seq(
            new Literal("("),
            new Alt(new Literal("-"), new LiteralIC("not ")),
            new ValueParser(),
            new Literal(")")
        ));
  }

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    return null; //TODO parse N negative values 
  }
}
