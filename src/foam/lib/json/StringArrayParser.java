/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;

public class StringArrayParser
  extends ProxyParser
{
  public StringArrayParser() {
    super(
      new Alt(
        new NullParser(),
        new Seq1(3,
          new Whitespace(),
          new Literal("["),
          new Whitespace(),
          new Repeat(
            new StringParser(),
            new Seq0(new Whitespace(), new Literal(","), new Whitespace())),
          new Whitespace(),
          new Literal("]"))
      ));
  }

  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);
    if ( ps == null ) {
      return null;
    }
    if ( ps.value() == null ) return ps;

    Object[] objs = (Object[]) ps.value();
    String[] str = new String[objs.length];
    for ( int i = 0 ; i < objs.length ; i++ ) {
      str[i] = (String) objs[i];
    }
    return ps.setValue(str);
  }
}
