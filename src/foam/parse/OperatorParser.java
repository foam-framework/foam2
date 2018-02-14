/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.parse;

import java.util.List;

import foam.lib.json.Whitespace;
import foam.lib.parse.Alt;
import foam.lib.parse.Literal;
import foam.lib.parse.PStream;
import foam.lib.parse.ParserContext;
import foam.lib.parse.ProxyParser;
import foam.mlang.MLang;
import foam.mlang.predicate.Predicate;

public class OperatorParser extends ProxyParser {

  public OperatorParser() {
    super(
        new Alt(
          new Literal("AND"),
          new Literal("and"),
          new Literal("OR"),
          new Literal("or"),
          new Literal("|"),
          new Literal(" "),
          new Whitespace()));    
  }

  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);
    if (ps == null)
      return null;

    if (ps.value().toString().toLowerCase().equals("or") || ps.value().toString().equals("|")) {
      ((List<Predicate>) x.get("objPar")).add(MLang.OR(null));
    } else if (ps.value().toString().toLowerCase().equals("and")) {
      ((List<Predicate>) x.get("objPar")).add(MLang.AND(null));
    }
    return ps;
  }
}
