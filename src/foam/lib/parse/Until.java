package foam.lib.parse;

public class Until
  implements Parser {

  protected Parser until_;

  public Until(Parser until) {
    until_ = until;
  }

  public PStream parse(PStream ps, ParserContext x) {
    Parser repeat = new Seq0(AnyChar.instance(), new Not(until_));
    return repeat.parse(ps, x);
  }
}
