/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.query;

import java.util.Calendar;
import java.util.Date;

import foam.lib.json.IntParser;
import foam.lib.parse.Alt;
import foam.lib.parse.Literal;
import foam.lib.parse.PStream;
import foam.lib.parse.ParserContext;
import foam.lib.parse.ProxyParser;
import foam.lib.parse.Seq;
//today-7
//today
public class RelativeDateParser extends ProxyParser {

  public RelativeDateParser() {
    super(
        new Alt(
        //today-7
          new Seq(
            new Literal("today"),
            new Literal("-"),
            new IntParser()),

        //today
          new Literal("today")));
  }

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);
    if (ps == null ) return null;

    // example today or today-7 {today,"-",7}
    Object[] result = null;
    result = new Integer[6];
    result[0] = new java.util.GregorianCalendar().getInstance().get(Calendar.YEAR);
    result[2] = new java.util.GregorianCalendar().getInstance().get(Calendar.MONTH) + 1;
    result[4] = new java.util.GregorianCalendar().getInstance().get(Calendar.DAY_OF_MONTH);

    java.util.Calendar c = new java.util.GregorianCalendar();

    Date date1 = null, date2 = null;
    c.clear();

    c.set(
      result.length > 1 ? (Integer) result[0] : 0,
      result.length > 3 ? (Integer) result[2] - 1 : 0,
      result.length > 5 ? (Integer) result[4] : 0,
      result.length > 7 ? (Integer) result[6] : 0,
      result.length > 9 ? (Integer) result[8] : 0,
      result.length > 11 ? (Integer) result[10] : 0);
    date1 = c.getTime();
    c.clear();

    Date[] dates = null;
    // {today,"-",7}
    if (ps.value() instanceof Object[]
        && (((Object[]) ps.value()).length < 4 && ((Object[]) ps.value())[0] instanceof String)) {
        c.set(
          result.length > 1 ? (Integer) result[0] + (result.length > 3 ? 0 : 1) : 0,
          result.length > 3 ? (Integer) result[2] - 1 + (result.length > 5 ? 0 : 1) : 0,//TODO -1
          result.length > 5 ? (Integer) result[4] - (Integer)((Object[]) ps.value())[2] : 0//to include that date
        );
      date2 = c.getTime();
      dates = new Date[] { date2, date1 };
    } else {//today
      c.clear();
        c.set(
          result.length > 1 ? (Integer) result[0] + (result.length > 3 ? 0 : 1) : 0,
          result.length > 3 ? (Integer) result[2] - 1 + (result.length > 5 ? 0 : 1) : 0,
          result.length > 5 ? (Integer) result[4] + (result.length > 7 ? 0 : 1) : 0,
          result.length > 7 ? (Integer) result[6] + (result.length > 9 ? 0 : 1) : 0,
          result.length > 9 ? (Integer) result[8] + (result.length > 11 ? 0 : 1) : 0,
          result.length > 11 ? (Integer) result[10] + (result.length > 13 ? 0 : 1) : 0);
      date2 = c.getTime();
      dates = new Date[] { date1, date2 };
    }
    return ps.setValue(dates);
  }

}
