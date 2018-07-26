/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.query;

import java.util.Date;

import foam.lib.json.IntParser;
import foam.lib.parse.Alt;
import foam.lib.parse.Literal;
import foam.lib.parse.PStream;
import foam.lib.parse.ParserContext;
import foam.lib.parse.ProxyParser;
import foam.lib.parse.Seq;
//YYYY-MM-DD..YYYY-MM-DD
public class YYYYMMDDRangeDateParser extends ProxyParser  {

  public YYYYMMDDRangeDateParser() {
    super(new Seq(
        new IntParser(),
        new Alt(
            new Literal("-"),
            new Literal("/")),
        new IntParser(),
        new Alt(
            new Literal("-"),
            new Literal("/")),
        new IntParser(),
        new Literal(".."),
        new IntParser(),
        new Alt(
            new Literal("-"),
            new Literal("/")),
        new IntParser(),
        new Alt(
            new Literal("-"),
            new Literal("/")),
        new IntParser()));
  }

  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);
    if ( ps == null ) return null;

    Object[] result;
    result = (Object[]) ps.value();

    java.util.Calendar c = new java.util.GregorianCalendar();
    // d1..d2
    if ( result.length > 10 && result[5].equals("..") ) {
      Date date1 = null, date2 = null;
      c.set((Integer) result[0], (Integer) result[2] - 1, (Integer) result[4]);
      date1 = c.getTime();
      c.clear();
      c.set((Integer) result[6], (Integer) result[8] - 1, (Integer) result[10]);
      date2 = c.getTime();

      Date[] dates = new Date[] { date1, date2 };
      return ps.setValue(dates);
    }
    return null;
  }
}
