/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;
import foam.util.SafetyUtil;

import java.util.Calendar;
import java.util.Date;
import java.util.TimeZone;

public class DateParser
  extends ProxyParser
{
  protected static ThreadLocal<StringBuilder> sb = new ThreadLocal<StringBuilder>() {
    @Override
    protected StringBuilder initialValue() {
      return new StringBuilder();
    }

    @Override
    public StringBuilder get() {
      StringBuilder b = super.get();
      b.setLength(0);
      return b;
    }
  };

  public DateParser() {
    super(new Alt(
      new NullParser(),
      new LongParser(),
      new Seq(
        new Literal("\""),
        new IntParser(),
        new Literal("-"),
        new IntParser(),
        new Literal("-"),
        new IntParser(),
        new Literal("T"),
        new IntParser(),
        new Literal(":"),
        new IntParser(),
        new Literal(":"),
        new IntParser(),
        new Literal("."),
        new Repeat(new Chars("0123456789")),
        new Literal("Z"),
        new Literal("\""))));
  }

  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);

    if ( ps == null ) {
      return null;
    }

    if ( ps.value() == null ) {
      return ps.setValue(null);
    }

    // Checks if Long Date (Timestamp from epoch)
    if ( ps.value() instanceof Long ) {
      return ps.setValue(new Date((Long) ps.value()));
    }

    Object[] result = (Object[]) ps.value();

    // TODO: Handle sub-millisecond accuracy, either with java 8 java.time package or some custom type
    // to support java 7

    Calendar c = Calendar.getInstance(TimeZone.getTimeZone("UTC"));
    c.clear();

    c.set(
      (Integer) result[1],
      (Integer) result[3] - 1, // Java calendar uses zero-indexed months
      (Integer) result[5],
      (Integer) result[7],
      (Integer) result[9],
      (Integer) result[11]);

    boolean zeroPrefixed = true;
    StringBuilder milliseconds = sb.get();
    Object[] millis = (Object[]) result[13];

    for ( int i = 0 ; i < millis.length ; i++ ) {
      // do not prefix with zeros
      if ( zeroPrefixed && '0' == (char) millis[i] ) {
        continue;
      }

      // append millisecond
      if ( zeroPrefixed ) zeroPrefixed = false;
      milliseconds.append((char) millis[i]);
    }

    // try to parse milliseconds, default to 0
    c.add(Calendar.MILLISECOND, ! SafetyUtil.isEmpty(milliseconds.toString()) ?
      Integer.parseInt(milliseconds.toString(), 10) : 0);
    return ps.setValue(c.getTime());
  }
}
