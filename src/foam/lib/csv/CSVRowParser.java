package foam.lib.csv;

import foam.lib.parse.*;

public class CSVRowParser implements Parser {
  private Parser delegate;

  public CSVRowParser() {
    delegate = new Repeat(new CSVStringParser(), new Literal(","));
  }

  public PStream parse(PStream ps, ParserContext x) {
    return ps.apply(delegate, x);
  }
}