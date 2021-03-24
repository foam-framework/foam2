
/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.parse;

public class Until
  implements Parser {

  protected Parser until_;

  public Until(Parser until) {
    until_ = new Seq1(0,
      new Repeat(new Not(until, AnyChar.instance())),
      until
    );
  }

  public PStream parse(PStream ps, ParserContext x) {
    PStream pst = until_.parse(ps, x);
    return pst;
  }
}