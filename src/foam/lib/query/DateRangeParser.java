package foam.lib.query;

import foam.lib.parse.Literal;
import foam.lib.parse.ProxyParser;
import foam.lib.parse.Seq2;

public class DateRangeParser
  extends ProxyParser {

  public DateRangeParser() {
    setDelegate(new Seq2(0, 2,
                         new DateParser(),
                         new Literal(".."),
                         new DateParser()));
  }
}
