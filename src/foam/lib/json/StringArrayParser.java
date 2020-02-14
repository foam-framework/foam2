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
  private final static Parser instance__ = new StringArrayParser();
  public static Parser instance() { return instance__; }
  
  private StringArrayParser() {
    super(
      new Alt(
        NullParser.instance(),
        new Seq1(3,
          Whitespace.instance(),
          Literal.create("["),
          Whitespace.instance(),
          new Repeat(
            StringParser.instance(),
            new Seq0(Whitespace.instance(), Literal.create(","), Whitespace.instance())),
          Whitespace.instance(),
          Literal.create("]"))
      ));
  }

  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);

    if ( ps == null ) return null;

    if ( ps.value() == null ) return ps;

    Object[] objs = (Object[]) ps.value();
    String[] str = new String[objs.length];
    for ( int i = 0 ; i < objs.length ; i++ ) {
      str[i] = (String) objs[i];
    }

    return ps.setValue(str);
  }
}
