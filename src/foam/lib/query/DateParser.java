/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.query;

import foam.lib.json.IntParser;
import foam.lib.parse.Literal;
import foam.lib.parse.Parser;
import foam.lib.parse.ParserContext;
import foam.lib.parse.ProxyParser;
import foam.lib.parse.PStream;
import foam.lib.parse.Seq;

public class DateParser
  extends ProxyParser
{

  private final static Parser instance__ = new DateParser();

  public static Parser instance() { return instance__; }

  // TODO: make private
  public DateParser() {
    setDelegate(new Seq(// YYYY/MM/DD
      IntParser.instance(),
      Literal.create("/"),
      IntParser.instance(),
      Literal.create("/"),
      IntParser.instance()));
  }

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);
    if ( ps == null ) return ps;

    Object[] values = (Object[])ps.value();

    return ps.setValue(new foam.mlang.Constant(new java.util.GregorianCalendar(((Integer)values[0]).intValue(), ((Integer)values[2]).intValue(), ((Integer)values[4]).intValue()).getTime()));
  }
}
