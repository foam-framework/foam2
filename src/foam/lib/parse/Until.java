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
    until_ = new Not(until, AnyChar.instance());
  }

  public PStream parse(PStream ps, ParserContext x) {
    return until_.parse(ps, x);
  }
}
