/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.parse;

import java.util.List;

import foam.lib.parse.Alt;
import foam.lib.parse.Literal;
import foam.lib.parse.PStream;
import foam.lib.parse.ParserContext;
import foam.lib.parse.ProxyParser;
import foam.mlang.MLang;
import foam.mlang.predicate.Predicate;

public class NotExpression extends ProxyParser {

  public NotExpression() {
    super(
          new Alt(           
            new Literal("NOT"),
            new Literal("Not"),
            new Literal("not"),
            new Literal("-")));
  }

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);
    if (ps == null)
      return null;

    if (ps.value().toString().toLowerCase().equals("not") || ps.value().toString().equals("-")) {
      ((List<Predicate>) x.get("objPar")).add(MLang.NOT(null));
    }
    return ps;
  }
}
