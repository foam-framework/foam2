package foam.lib.query;

import foam.lib.json.IntParser;
import foam.lib.parse.Literal;
import foam.lib.parse.PStream;
import foam.lib.parse.ParserContext;
import foam.lib.parse.ProxyParser;
import foam.lib.parse.Seq;

public class DateParser
  extends ProxyParser {

  public DateParser() {
    setDelegate(new Seq(// YYYY/MM/DD
                        new IntParser(),
                        new Literal("/"),
                        new IntParser(),
                        new Literal("/"),
                        new IntParser()));
  }

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);
    if ( ps == null ) return ps;

    Object[] values = (Object[])ps.value();

    return ps.setValue(new foam.mlang.Constant(new java.util.GregorianCalendar(((Integer)values[0]).intValue(), ((Integer)values[2]).intValue(), ((Integer)values[4]).intValue()).getTime()));
  }
}
