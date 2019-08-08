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
  public SinkParser(final ClassInfo info) {
    super(new Alt(
      new Literal("*"),
      new Repeat(expressionParser(info), ",", 1)));
  }

  public static Parser expressionParser(ClassInfo info) {
    ClassInfo    cInfo = info;
    List         properties = cInfo.getAxiomsByClass(PropertyInfo.class);
    List<Parser> parsers    = new ArrayList<Parser>();

    for ( Object prop : properties ) {
      PropertyInfo pInfo = (PropertyInfo) prop;

      parsers.add(new LiteralIC(pInfo.getName()));
    }

    return new Alt(parsers);
  }
}
