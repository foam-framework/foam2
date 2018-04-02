/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.parse;

public class Chars implements Parser {
  protected String chars;

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
