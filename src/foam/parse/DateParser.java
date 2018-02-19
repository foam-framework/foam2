/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.parse;

import java.util.Calendar;
import java.util.Date;

import foam.lib.json.IntParser;
import foam.lib.json.LongParser;
import foam.lib.json.Whitespace;
import foam.lib.parse.Alt;
import foam.lib.parse.Literal;
import foam.lib.parse.Optional;
import foam.lib.parse.PStream;
import foam.lib.parse.ParserContext;
import foam.lib.parse.ProxyParser;
import foam.lib.parse.Seq;

//YYYY
//YYYY-MM               YYYY/MM
//YYYY-MM-DD            YYYY/MM/DD
//YYYY-MM-DDTHH         YYYY/MM/DDTHH
//YYYY-MM-DDTHH:MM      YYYY/MM/DDTHH:MM
//YYYY-MM-DD..YYYY-MM-DDYYYY-MM-DD..YYYY-MM-DD
//today
//today-7
public class DateParser
  extends ProxyParser
{
  public DateParser() {
    super(
        new Alt(

          //YYYY-MM-DD..YYYY-MM-DD
          new Seq(
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
            new IntParser()),

          //YYYY-MM-DDTHH:MM
            new Seq(
              new IntParser(),
              new Alt(
                new Literal("-"),
                new Literal("/")),
              new IntParser(),
              new Alt(
                new Literal("-"),
                new Literal("/")),
              new IntParser(),
              new Literal("T"),
              new IntParser(),
              new Literal(":"),
              new IntParser()),

          //YYYY-MM-DDTHH
            new Seq(
              new IntParser(),
              new Alt(
                new Literal("-"),
                new Literal("/")),
              new IntParser(),
              new Alt(
                new Literal("-"),
                new Literal("/")),
              new IntParser(),
              new Literal("T"),
              new IntParser()),

          //YYYY-MM-DD
            new Seq(
              //new Literal("\""),
              new IntParser(),
              new Alt(
                  new Literal("-"),
                  new Literal("/")),
              new IntParser(),
              new Alt(
                  new Literal("-"),
                  new Literal("/")),
              new IntParser(),
              new Whitespace()),

          //YYYY-MM
            new Seq(
                new IntParser(),
                new Alt(
                    new Literal("-"),
                    new Literal("/")),
                new IntParser(),
                new Whitespace()),

          //YYYY
            new Seq(
                new IntParser(),
                new Whitespace()),
          new LongParser(),

          //today-7
          new Seq(
            new Literal("today"),
            new Literal("-"),
            new IntParser()),

          //today
          new Literal("today")
      ));
  }

  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);

    if ( ps == null ) return null;

    if ( ps.value() instanceof java.lang.Long ) {
      return ps.setValue(new java.util.Date((java.lang.Long) ps.value()));
    }
    Object[] result;
    // example today or today-7 {today,"-",7}
    if ((ps.value() instanceof String && ps.value().equals("today"))
        || (((Object[]) ps.value())[0] instanceof String && ((Object[]) ps.value())[0].equals("today"))) {
      result = new Integer[6];
      result[0] = new java.util.GregorianCalendar().getInstance().get(Calendar.YEAR);
      result[2] = new java.util.GregorianCalendar().getInstance().get(Calendar.MONTH) + 1;
      result[4] = new java.util.GregorianCalendar().getInstance().get(Calendar.DAY_OF_MONTH);
    } else {
      result = (Object[]) ps.value();
    }

    java.util.Calendar c = new java.util.GregorianCalendar();
    //d1..d2
    if (result.length > 10 && result[5].equals("..")) {
      Date date1 = null, date2 = null;
      c.set(
          (Integer) result[0],
          (Integer) result[2] - 1,
          (Integer) result[4]);
      date1 = c.getTime();
      c.clear();
      c.set(
          (Integer) result[6],
          (Integer) result[8] - 1,
          (Integer) result[10]);
      date2 = c.getTime();

      Date[] dates = new Date[] { date1, date2 };
      return ps.setValue(dates);
    }else if (result.length>8) {
    //YYYY-MM-DDTHH:MM
      c.clear();
      c.set(
        (Integer) result[0],
        (Integer) result[2] - 1,
        (Integer) result[4],
        (Integer) result[6],
        (Integer) result[8]);
      if (result.length > 11) {
        // TODO: There has to be a better way to do this.
        StringBuilder nanoseconds = new StringBuilder();
        nanoseconds.append("0.");
        Object[] nanos = (Object[]) result[11];
        for (int i = 0; i < nanos.length; i++) {
          nanoseconds.append(String.valueOf(nanos[i]));
        }
        c.add(c.MILLISECOND, (int) (Float.parseFloat(nanoseconds.toString()) * 1000));
      }
      return ps.setValue(c.getTime());
    } else {
      // this is a particular case for treating the partially date YYYY or YYYY-MM
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
      //{today,"-",7}
      if ( ps.value() instanceof Object[] && (((Object[]) ps.value()).length<4  && 
          ((Object[]) ps.value())[0] instanceof String)) {
        c.set(
            result.length > 1 ? (Integer) result[0] + (result.length > 3 ? 0 : 1) : 0,
            result.length > 3 ? (Integer) result[2] - 1 + (result.length > 5 ? 0 : 1) : 0,
                //TODO -1
            result.length > 5 ? (Integer) result[4] - (Integer)((Object[]) ps.value())[2] : 0//to include that date
            );
        date2 = c.getTime();
        dates = new Date[] { date2, date1 };
      } else {c.clear();
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
}
