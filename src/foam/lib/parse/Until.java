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
    until_ = until;
  }

  public PStream parse(PStream ps, ParserContext x) {
    Parser repeat = new Not(until_, AnyChar.instance());
    return repeat.parse(ps, x);
  }
}
