/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.parse;

public class Range implements Parser {
  private char from;
  private char to;

  public Range(char from, char to) {
    this.from = from;
    this.to   = to;
  }

  public PStream parse(PStream ps, ParserContext x) {
    if ( ps.valid() && ( ps.head() >= from ) && ( ps.head() <= to ) ) {
      return ps.tail().setValue(ps.head());
    }

    return null;
  }

  public String toString() {
    return "Range(" + from + "-" + to + ")";
  }
}
