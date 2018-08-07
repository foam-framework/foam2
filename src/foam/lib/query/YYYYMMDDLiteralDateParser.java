/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.query;

import java.util.Date;

import foam.lib.json.IntParser;
import foam.lib.json.Whitespace;
import foam.lib.parse.Alt;
import foam.lib.parse.Literal;
import foam.lib.parse.PStream;
import foam.lib.parse.ParserContext;
import foam.lib.parse.ProxyParser;
import foam.lib.parse.Seq;

//YYYY-MM-DDTHH:MM
//YYYY-MM-DDTHH
//YYYY-MM-DD
//YYYY-MM
//YYYY
public class YYYYMMDDLiteralDateParser extends ProxyParser {

  public YYYYMMDDLiteralDateParser() {
    super(
        new Alt(

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
            new IntParser()),

          //YYYY-MM
          new Seq(
            new IntParser(),
            new Alt(
              new Literal("-"),
              new Literal("/")),
            new IntParser()),//,new Whitespace()

          //YYYY
          new Seq(
            new IntParser())//,new Whitespace()
          ));

  }

  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse( ps, x );
    if ( ps == null ) return ps;

    return ps.setValue(getDates((Object[]) ps.value()));
  }

  protected Date[] getDates(Object[] result) {
    java.util.Calendar c = new java.util.GregorianCalendar();

    Date date1 = null, date2 = null;
    c.clear();

    c.set(result.length >= 1 ? (Integer) result[0] : 0,
        result.length >= 3 ? (Integer) result[2] - 1 : 0,
        result.length >= 5 ? (Integer) result[4] : 0,
        result.length >= 7 ? (Integer) result[6] : 0,
        result.length >= 9 ? (Integer) result[8] : 0,
        result.length >= 11 ? (Integer) result[10] : 0);

    date1 = c.getTime();
    
    if ( result.length < 3 ) 
      c.add(java.util.Calendar.YEAR, 1);
    else if ( result.length < 5 ) 
      c.add(java.util.Calendar.MONTH, 1);
    else if ( result.length < 7 ) 
      c.add(java.util.Calendar.DAY_OF_MONTH, 1);
    else if ( result.length < 9 ) 
      c.add(java.util.Calendar.HOUR_OF_DAY, 1);
    else if ( result.length < 11 ) 
      c.add(java.util.Calendar.MINUTE, 1);

    date2 = c.getTime();

    Date[] dates = null;
    dates = new Date[] { date1, date2 };
    return dates;
  }
}
