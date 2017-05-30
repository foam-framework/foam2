package foam.lib.json;

import foam.lib.parse.*;

public class DateParser extends ProxyParser {
  public DateParser() {
    super(new Seq(
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
                  new Literal("\"")));
  }

  public PStream parse(PStream ps, ParserContext x) {
    System.out.println("Parsing date");
    ps = super.parse(ps, x);

    if ( ps == null ) return null;

    System.out.println("Succcess.");

    Object[] result = (Object[])ps.value();

    // TODO: Handle sub-milisecond accuracy, either with java 8 java.time pacakge or some custom type
    // to support java 7

    java.util.Calendar c = new java.util.GregorianCalendar(java.util.TimeZone.getTimeZone("UTC"));
    c.clear();
    c.set(
          (Integer)result[1],
          (Integer)result[3] - 1, // Java calendar uses zero-indexed months
          (Integer)result[5],
          (Integer)result[7],
          (Integer)result[9],
          (Integer)result[11]);

    // TODO: There has to be a better way to do this.
    StringBuilder nanoseconds = new StringBuilder();
    nanoseconds.append("0.");
    Object[] nanos = (Object[])result[13];
    for ( int i = 0 ; i < nanos.length ; i++ ) {
      nanoseconds.append(String.valueOf(nanos[i]));
    }

    c.add(c.MILLISECOND, (int)(Float.parseFloat(nanoseconds.toString()) * 1000));

    return ps.setValue(c.getTime());
  }
}
