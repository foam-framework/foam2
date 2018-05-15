/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.parse;

public class Chars
  implements Parser
{
  protected String chars_;

  public Chars(String s) {
    chars_ = s;
  }

  public PStream parse(PStream ps, ParserContext x) {
    return ps.valid() && chars_.indexOf(ps.head()) != -1 ?
      ps.tail().setValue(ps.head()) :
      null ;
  }
}
