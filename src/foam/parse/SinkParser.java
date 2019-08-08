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
 *   firstName, lastName
 *   MIN(age), AVG(age), MAX(age)
 *   SUM(amount), COUNT(*)
 *   ???: GROUP BY
 **/
public class SinkParser
  extends ProxyParser
{
  static ClassInfo info_;

  public SinkParser() {
    this(null);
  }

  public SinkParser(final ClassInfo info) {
    super(new Alt(
      new Literal("*"),
      new Repeat(expressionParser(info), ",", 1)));
  }

  public static Parser expressionParser(ClassInfo cInfo) {
    info_ = cInfo;
    List         properties = info_.getAxiomsByClass(PropertyInfo.class);
    List<Parser> parsers    = new ArrayList<Parser>();

    for ( Object prop : properties ) {
      PropertyInfo info = (PropertyInfo) prop;

      parsers.add(new LiteralIC(info.getName()));
    }

    return new Alt(parsers);
  }

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    x = x.sub();
    x.set("classInfo", info_);

    return super.parse(ps, x);
  }
}
