/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.parse;

import foam.core.ClassInfo;
import foam.core.PropertyInfo;
import foam.lib.parse.*;
import foam.lib.query.*;

import java.util.ArrayList;
import java.util.List;

public class QueryParser
  extends ProxyParser
{
  protected ClassInfo info_;

  public QueryParser(ClassInfo classInfo) {
    info_ = classInfo;

    List         properties  = classInfo.getAxiomsByClass(PropertyInfo.class);
    List<Parser> expressions = new ArrayList<Parser>();

    for ( Object prop : properties ) {
      PropertyInfo info = (PropertyInfo) prop;

      expressions.add(PropertyExpressionParser.create(info));
      expressions.add(new NegateParser(PropertyExpressionParser.create(info)));
      expressions.add(new HasParser(info));
      expressions.add(new ParenParser(PropertyExpressionParser.create(info)));

      if ( info.getSQLType().equalsIgnoreCase("BOOLEAN") ) expressions.add(new IsParser(info));
    }

    expressions.add(new MeParser());
    expressions.add(new IsInstanceOfParser());

    Parser[] parsers = expressions.toArray(new Parser[expressions.size()]);
    Parser altParser = new Alt(parsers);

    var orAnd = new OrParser(new AndParser(altParser));
    setDelegate(new Alt(
      new OrParser(new Alt(
        new AndParser(new Alt(new ParenParser(orAnd), altParser)),
        new ParenParser(orAnd),
        orAnd)),
      new AndParser(new Alt(new ParenParser(orAnd), altParser))
    ));
  }

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    x = x.sub();
    x.set("classInfo", info_);

    return super.parse(ps, x);
  }
}
