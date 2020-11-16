/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.parse;

public class Seq3
  implements Parser
{
  private Parser[] parsers;
  private int      index1;
  private int      index2;
  private int      index3;

  public Seq3(int i, int j, int k,  Parser... args) {
    parsers = args;
    index1  = i;
    index2  = j;
    index3 = k;
  }

  public PStream parse(PStream ps, ParserContext x) {
    Object[] value = new Object[3];

    for ( int i = 0 ; i < parsers.length ; i++ ) {
      ps = ps.apply(parsers[i], x);
      if ( ps == null ) return null;
      if ( i == index1 ) value[0] = ps.value();
      if ( i == index2 ) value[1] = ps.value();
      if ( i == index3 ) value[2] = ps.value();
    }

    return ps.setValue(value);
  }
}
