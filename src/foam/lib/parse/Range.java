/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.parse;

import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

// TODO: make into a Multiton
public class Range
  implements Parser
{
  protected final static Map map__ = new ConcurrentHashMap();

  /**
   * Implement the multiton pattern so we don't create the same Range
   * parser more than once.
   **/
  public static Parser create(char from, char to) {
    String key = from + "" + to;
    Parser p   = (Parser) map__.get(key);

    if ( p == null ) {
      p = new Range(from, to);
      map__.put(key, p);
    }

    return p;
  }


  protected char from_;
  protected char to_;

  private Range(char from, char to) {
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
