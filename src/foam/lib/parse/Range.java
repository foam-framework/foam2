/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.parse;

// TODO: make into a Multiton
public class Range
  implements Parser
{
  private char from_;
  private char to_;

  public Range(char from, char to) {
    from_ = from;
    to_   = to;
  }

  public PStream parse(PStream ps, ParserContext x) {
    if ( ps.valid() && ( ps.head() >= from_ ) && ( ps.head() <= to_ ) ) {
      return ps.tail().setValue(ps.head());
    }

    return null;
  }

  public String toString() {
    return "Range(" + from_ + "-" + to_ + ")";
  }
}
