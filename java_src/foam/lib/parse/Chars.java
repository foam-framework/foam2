package foam.lib.parse;

public class Chars implements Parser {
  private String chars;
  public Chars(String s) {
    chars = s;
  }

  public PStream parse(PStream ps, ParserContext x) {
    if ( ps.valid() && chars.indexOf(ps.head()) != -1 ) {
      return ps.tail().setValue(ps.head());
    }
    return null;
  }
}
