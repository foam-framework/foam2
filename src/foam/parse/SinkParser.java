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
import java.io.*;

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

  public static Parser expressionParser(ClassInfo cInfo) {
    List         properties = cInfo.getAxiomsByClass(PropertyInfo.class);
    List<Parser> parsers    = new ArrayList<Parser>();

    for ( Object prop : properties ) {
      PropertyInfo pInfo = (PropertyInfo) prop;

      parsers.add(new LiteralIC(pInfo.getName()));
//      parsers.add(new LiteralIC("min(" + pInfo.getName() + ")"));
//      parsers.add(new LiteralIC("avg(" + pInfo.getName() + ")"));
//      parsers.add(new LiteralIC("sum(" + pInfo.getName() + ")"));
//      parsers.add(new LiteralIC("max(" + pInfo.getName() + ")"));
//      parsers.add(new LiteralIC("count(" + pInfo.getName() + ")"));
    }

    return new Alt(parsers);
  }

//  @Override
//  public PStream parse(PStream ps, ParserContext x) {
//    ps = super.parse(ps, x);
//
//    if ( ps == null ) {
//      return null;
//    }
//
//    if ( ps.value() == null ) {
//      return ps;
//    }
//
//    x = x.sub();
//    //x.set("classInfo", info_);
//
//    //return super.parse(ps, x);
//  }
}
