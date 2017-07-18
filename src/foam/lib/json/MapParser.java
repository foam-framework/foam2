/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.lib.parse.*;

public class MapParser extends ProxyParser {
  public MapParser() {
    super(
          new Seq1(1,
                   new Whitespace(),
                   new Alt(
                      new Seq1(1, new Literal("{"), new Whitespace(), new Literal("}")),
                      new Seq1(1, new Literal("{"),
                                  new Repeat(
                                      new Seq2(1, 5,
                                              new Whitespace(),
                                              new AnyKeyParser(),
                                              new Whitespace(),
                                              new Literal(":"),
                                              new Whitespace(),
                                              new AnyParser()),
                                      new Seq0(new Whitespace(), new Literal(","))),
                                  new Literal("}"))
                   ),
                   new Whitespace())
          );
  }

  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);

    if ( ps != null ) {
      // Checks if ps value is "{" char (as whitespace doesn't set ps value)
      if ( ( ps.value() instanceof String ) && ( ( (String) ps.value() ).equals("{") ) ) {
        // Sets value to empty hashmap
        return ps.setValue(new java.util.HashMap());
      }

      Object[] values = (Object[])ps.value();
      java.util.Map map = new java.util.HashMap(values.length);

      for ( int i = 0 ; i < values.length ; i++ ) {
        Object[] item = (Object[])values[i];

        map.put(item[0], item[1]);
      }

      return ps.setValue(map);
    }

    return ps;
  }
}
