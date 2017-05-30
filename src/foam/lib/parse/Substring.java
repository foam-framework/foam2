package foam.lib.parse;

public class Substring extends ProxyParser {
  public Substring(Parser delegate) {
    super(delegate);
  }

  public PStream parse(PStream ps, ParserContext x) {
    PStream start = ps;

    ps = super.parse(ps, x);

    if ( ps != null ) {
      return ps.setValue(start.substring(ps));
    }

    return ps;
  }
}
