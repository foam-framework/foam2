/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.parse;

import foam.core.*;
import foam.lib.parse.*;
import java.util.ArrayList;
import java.util.List;

/**
 * SQL-syntax-like parser for defining Sink's.
 * Examples:
 *   *
 *   firstName, lastName           -> SEQ(FIRST_NAME, LAST_NAME)
 *   MIN(age), AVG(age), MAX(age)  -> SEQ(MIN(AGE), AVG(AGE), MAX(age))
 *   SUM(amount), COUNT(*)         -> SEQ(SUM(AMOUNT), COUNT())
 *   count GROUP BY country        -> GROUP_BY(COUNTRY, COUNT())
 **/
public class SinkParser
  extends Alt
{
  protected ClassInfo info_;

  public SinkParser(ClassInfo info) {
    parsers_ = new Parser[] {
      starParser(),
      expressionListParser()
    };

    info_ = info;
  }

  public Parser starParser() {
    return Literal.create("*");
  }

  public Parser expressionListParser() {
    return new Repeat(expressionParser(), ",", 1);
  }

  public Parser expressionParser() {
    List         properties = info_.getAxiomsByClass(PropertyInfo.class);
    List<Parser> parsers    = new ArrayList<Parser>();

    for ( Object prop : properties ) {
      PropertyInfo info = (PropertyInfo) prop;

      parsers.add(new LiteralIC(info.getName()));
    }

    return new Alt(parsers);
  }

  /*
  @Override
  public PStream parse(PStream ps, ParserContext x) {
    x = x.sub();
    x.set("classInfo", info_);

    return super.parse(ps, x);
  }
  */
}
