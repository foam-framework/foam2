/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;

public class MapParser
  extends ObjectNullParser
{
  public MapParser() {
    super(new Seq1(3,
                   new Whitespace(),
                   new Literal("{"),
                   new Whitespace(),
                   new Repeat(new Seq2(1, 5,
                                       new Whitespace(),
                                       new AnyKeyParser(),
                                       new Whitespace(),
                                       new Literal(":"),
                                       new Whitespace(),
                                       AnyParser.instance()),
                              new Seq0(new Whitespace(), new Literal(","))),
                   new Whitespace(),
                   new Literal("}")));
  }

  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);
    if ( ps == null ) return ps;

    Object[] values = (Object[]) ps.value();
    java.util.Map map = new java.util.HashMap(values.length);

    for ( int i = 0 ; i < values.length ; i++ ) {
      Object[] item = (Object[]) values[i];

      map.put(item[0], item[1]);
    }

    return ps.setValue(map);
  }
}
