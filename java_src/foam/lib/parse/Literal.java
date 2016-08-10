package foam.lib.parse;

public class Literal implements Parser {
  private String string;
  private String value;

  public Literal(String s) {
    this(s, s);
  }

  public Literal(String s, String v) {
    string = s;
    value = v;
  }

  public PStream parse(PStream ps, ParserContext x) {
    for ( int i = 0 ; i < string.length() ; i++ ) {
      if ( ! ps.valid() ||
           ps.head() != string.charAt(i) ) {
        return null;
      }

      ps = ps.tail();
    }

    return ps.setValue(value);
  }
}
