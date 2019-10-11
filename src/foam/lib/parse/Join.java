/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.parse;

public class Join implements Parser {
  Parser d;
  public Join(Parser d) {
    this.d = d;
  }
  public PStream parse(PStream ps, ParserContext x) {
    ps = ps.apply(d, x);
    if ( ps == null ) return null;

    java.util.List<Object> queue = new java.util.LinkedList<>();
    queue.add(ps.value());
    StringBuilder sb = new StringBuilder();
    while ( queue.size() > 0 ) {
      Object o = queue.remove(0);
      if ( o instanceof Object[] ) {
        queue.addAll(java.util.Arrays.asList((Object[])o));
      } else {
        sb.append(o.toString());
      }
    }

    return ps.setValue(sb.toString());
  }
}
