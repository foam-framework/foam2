package foam.lib.query;

import foam.lib.parse.*;

public class DateRangeParser
  extends ProxyParser {

  public DateRangeParser() {
    setDelegate(new Seq2(0, 2,
                         new DateParser(),
                         new Literal(".."),
                         new DateParser()));
  }
}
